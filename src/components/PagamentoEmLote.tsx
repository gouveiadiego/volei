import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Props {
  onClose: () => void;
}

export function PagamentoEmLote({ onClose }: Props) {
  const { toast } = useToast();
  const today = new Date().toISOString().split("T")[0];
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [paidIds, setPaidIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [mesAno, setMesAno] = useState(today.substring(0, 7));
  const [valor, setValor] = useState("40");
  const [dataPagamento, setDataPagamento] = useState(today);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("students")
      .select("id, name")
      .eq("active", true)
      .order("name")
      .then(({ data }) => setStudents(data || []));
  }, []);

  useEffect(() => {
    const due = `${mesAno}-01`;
    supabase
      .from("payments")
      .select("student_id")
      .eq("due_date", due)
      .eq("status", "paid")
      .then(({ data }) => {
        setPaidIds(new Set((data || []).map((p) => p.student_id as string)));
        setSelected(new Set());
      });
  }, [mesAno]);

  const pendentes = students.filter((s) => !paidIds.has(s.id));
  const allSelected = pendentes.length > 0 && pendentes.every((s) => selected.has(s.id));

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(pendentes.map((s) => s.id)));

  const salvar = async () => {
    const amount = parseFloat(valor);
    if (!selected.size || !amount) return;
    setSaving(true);
    const due = `${mesAno}-01`;
    const ids = Array.from(selected);
    try {
      const { data: existing } = await supabase
        .from("payments")
        .select("id, student_id")
        .eq("due_date", due)
        .in("student_id", ids);
      const existingMap = new Map((existing || []).map((p) => [p.student_id, p.id]));

      const toUpdate = ids.filter((id) => existingMap.has(id)).map((id) => existingMap.get(id)!);
      const toInsert = ids
        .filter((id) => !existingMap.has(id))
        .map((student_id) => ({
          student_id,
          amount,
          due_date: due,
          payment_date: dataPagamento,
          status: "paid" as const,
        }));

      if (toUpdate.length) {
        const { error } = await supabase
          .from("payments")
          .update({ status: "paid", amount, payment_date: dataPagamento })
          .in("id", toUpdate);
        if (error) throw error;
      }
      if (toInsert.length) {
        const { error } = await supabase.from("payments").insert(toInsert as any);
        if (error) throw error;
      }
      toast({ title: `${ids.length} pagamento(s) marcados como pagos!` });
      onClose();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro ao salvar", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Pagamento em Lote</DialogTitle>
          <DialogDescription>Marque quem já pagou e clique em "Marcar como pago".</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label>Mês/Ano</Label>
            <Input type="month" value={mesAno} onChange={(e) => setMesAno(e.target.value)} />
          </div>
          <div>
            <Label>Valor</Label>
            <Input type="number" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <div>
            <Label>Data pgto</Label>
            <Input type="date" value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} />
          </div>
        </div>

        <div className="border rounded-md">
          <label className="flex items-center gap-2 p-3 border-b font-medium cursor-pointer">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} disabled={!pendentes.length} />
            Selecionar todos ({selected.size}/{pendentes.length})
          </label>
          <div className="max-h-72 overflow-y-auto">
            {students.map((s) => {
              const pago = paidIds.has(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex items-center justify-between gap-2 px-3 py-2 ${pago ? "opacity-60" : "cursor-pointer hover:bg-muted"}`}
                >
                  <span className="flex items-center gap-2">
                    <Checkbox
                      checked={pago || selected.has(s.id)}
                      disabled={pago}
                      onCheckedChange={() => toggle(s.id)}
                    />
                    {s.name}
                  </span>
                  {pago && <span className="text-xs text-muted-foreground">Já pago</span>}
                </label>
              );
            })}
            {!students.length && <p className="p-3 text-sm text-muted-foreground">Nenhum aluno ativo.</p>}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={saving || !selected.size}>
            {saving ? "Salvando..." : `Marcar como pago (${selected.size})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

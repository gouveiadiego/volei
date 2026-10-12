import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeCheck, BadgeAlert } from "lucide-react";

type Resumo = { saldo: number; alunos: { name: string; pago: boolean }[] };

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ResumoPublico() {
  const { owner } = useParams();
  const [data, setData] = useState<Resumo | null>(null);
  const [erro, setErro] = useState(false);
  const now = new Date();
  const mes = format(now, "MMMM 'de' yyyy", { locale: ptBR });

  useEffect(() => {
    (supabase.rpc as any)("public_summary", { _owner: owner, _month: format(now, "yyyy-MM-01") })
      .then(({ data, error }: any) => (error ? setErro(true) : setData(data)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner]);

  if (erro) return <p className="p-8 text-center">Link inválido.</p>;
  if (!data) return <p className="p-8 text-center">Carregando...</p>;

  const pagos = data.alunos.filter((a) => a.pago);
  const pendentes = data.alunos.filter((a) => !a.pago);

  const Lista = ({ itens, pago }: { itens: typeof pagos; pago: boolean }) => (
    <ul className="space-y-1">
      {itens.map((a) => (
        <li key={a.name} className="flex items-center gap-2">
          {pago ? <BadgeCheck className="h-4 w-4 text-primary" /> : <BadgeAlert className="h-4 w-4 text-destructive" />}
          {a.name}
        </li>
      ))}
      {!itens.length && <li className="text-muted-foreground text-sm">Ninguém</li>}
    </ul>
  );

  return (
    <div className="min-h-screen bg-muted/40 p-4">
      <div className="mx-auto max-w-md space-y-4">
        <div className="text-center">
          <img src="/lovable-uploads/1c044492-f4f2-404f-bff0-43cdbe9078fa.png" alt="Vôlei" className="mx-auto h-20" />
          <h1 className="text-xl font-bold mt-2">Resumo do Vôlei</h1>
          <p className="text-muted-foreground capitalize">{mes}</p>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Saldo em caixa</p>
            <p className="text-3xl font-bold">{brl(Number(data.saldo))}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Falta pagar ({pendentes.length})</CardTitle></CardHeader>
          <CardContent><Lista itens={pendentes} pago={false} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Pagos ({pagos.length})</CardTitle></CardHeader>
          <CardContent><Lista itens={pagos} pago /></CardContent>
        </Card>
      </div>
    </div>
  );
}

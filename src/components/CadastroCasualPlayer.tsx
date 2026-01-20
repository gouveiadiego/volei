import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CasualPlayer {
  id: string;
  player_name: string;
  phone: string | null;
  game_date: string;
  amount: number;
  paid: boolean;
  notes: string | null;
}

interface CadastroCasualPlayerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playerToEdit?: CasualPlayer | null;
}

export function CadastroCasualPlayer({ open, onOpenChange, playerToEdit }: CadastroCasualPlayerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    player_name: "",
    phone: "",
    game_date: new Date().toISOString().split("T")[0],
    amount: "",
    paid: false,
    notes: "",
  });

  useEffect(() => {
    if (playerToEdit) {
      setFormData({
        player_name: playerToEdit.player_name,
        phone: playerToEdit.phone || "",
        game_date: playerToEdit.game_date,
        amount: playerToEdit.amount.toString(),
        paid: playerToEdit.paid,
        notes: playerToEdit.notes || "",
      });
    } else {
      setFormData({
        player_name: "",
        phone: "",
        game_date: new Date().toISOString().split("T")[0],
        amount: "",
        paid: false,
        notes: "",
      });
    }
  }, [playerToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.player_name || !formData.game_date || !formData.amount) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        player_name: formData.player_name,
        phone: formData.phone || null,
        game_date: formData.game_date,
        amount: parseFloat(formData.amount),
        paid: formData.paid,
        notes: formData.notes || null,
      };

      if (playerToEdit) {
        const { error } = await supabase
          .from("casual_players")
          .update(dataToSave)
          .eq("id", playerToEdit.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Jogador avulso atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from("casual_players")
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Jogador avulso cadastrado com sucesso!",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["casual-players"] });
      queryClient.invalidateQueries({ queryKey: ["casual-players-total"] });
      queryClient.invalidateQueries({ queryKey: ["financial-overview"] });
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {playerToEdit ? "Editar Jogador Avulso" : "Novo Jogador Avulso"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="player_name">Nome do Jogador *</Label>
            <Input
              id="player_name"
              value={formData.player_name}
              onChange={(e) => setFormData({ ...formData, player_name: e.target.value })}
              placeholder="Nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="game_date">Data do Jogo *</Label>
              <Input
                id="game_date"
                type="date"
                value={formData.game_date}
                onChange={(e) => setFormData({ ...formData, game_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="paid">Pagamento Realizado?</Label>
            <Switch
              id="paid"
              checked={formData.paid}
              onCheckedChange={(checked) => setFormData({ ...formData, paid: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações adicionais..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : playerToEdit ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

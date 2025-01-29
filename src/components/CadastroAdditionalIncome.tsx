import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  amount: z.string().min(1, "Valor é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

interface CadastroAdditionalIncomeProps {
  onClose: () => void;
  incomeToEdit?: {
    id: string;
    amount: number;
    date: string;
    description: string;
  };
}

export function CadastroAdditionalIncome({ onClose, incomeToEdit }: CadastroAdditionalIncomeProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: incomeToEdit ? String(incomeToEdit.amount) : "",
      date: incomeToEdit ? incomeToEdit.date : "",
      description: incomeToEdit?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const incomeData = {
        amount: parseFloat(values.amount),
        date: values.date,
        description: values.description,
      };

      let error;
      
      if (incomeToEdit) {
        console.log("Updating additional income:", incomeData);
        const { error: updateError } = await supabase
          .from("additional_income")
          .update(incomeData)
          .eq("id", incomeToEdit.id);
        error = updateError;
      } else {
        console.log("Creating new additional income:", incomeData);
        const { error: insertError } = await supabase
          .from("additional_income")
          .insert(incomeData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: incomeToEdit ? "Receita atualizada com sucesso!" : "Receita registrada com sucesso!",
      });
      onClose();
    } catch (error) {
      console.error("Error saving additional income:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar receita",
        description: "Por favor, tente novamente.",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{incomeToEdit ? "Editar Receita Adicional" : "Nova Receita Adicional"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
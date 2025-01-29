import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const formSchema = z.object({
  amount: z.string().min(1, "Valor é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
});

interface CadastroExpenseProps {
  onClose: () => void;
  expenseToEdit?: {
    id: string;
    amount: number;
    date: string;
    description: string;
    payment_date: string | null;
  };
}

export function CadastroExpense({ onClose, expenseToEdit }: CadastroExpenseProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: expenseToEdit ? String(expenseToEdit.amount) : "",
      date: expenseToEdit ? expenseToEdit.date : format(new Date(), "yyyy-MM-dd"),
      description: expenseToEdit?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const expenseData = {
        amount: parseFloat(values.amount),
        date: values.date,
        payment_date: values.date,
        description: values.description,
      };

      let error;
      
      if (expenseToEdit) {
        console.log("Updating expense:", expenseData);
        const { error: updateError } = await supabase
          .from("extra_expenses")
          .update(expenseData)
          .eq("id", expenseToEdit.id);
        error = updateError;
      } else {
        console.log("Creating new expense:", expenseData);
        const { error: insertError } = await supabase
          .from("extra_expenses")
          .insert(expenseData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: expenseToEdit ? "Despesa atualizada com sucesso!" : "Despesa registrada com sucesso!",
      });
      onClose();
    } catch (error) {
      console.error("Error saving expense:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar despesa",
        description: "Por favor, tente novamente.",
      });
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{expenseToEdit ? "Editar Despesa Extra" : "Nova Despesa Extra"}</DialogTitle>
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
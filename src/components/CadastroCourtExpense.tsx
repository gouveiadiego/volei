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
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  paymentDate: z.string().optional(),
  description: z.string().optional(),
});

interface CadastroCourtExpenseProps {
  onClose: () => void;
  expenseToEdit?: {
    id: string;
    amount: number;
    due_date: string;
    payment_date: string | null;
    description: string | null;
  };
}

export function CadastroCourtExpense({ onClose, expenseToEdit }: CadastroCourtExpenseProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: expenseToEdit ? String(expenseToEdit.amount) : "",
      dueDate: expenseToEdit ? expenseToEdit.due_date : "",
      paymentDate: expenseToEdit?.payment_date || "",
      description: expenseToEdit?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const expenseData = {
        amount: parseFloat(values.amount),
        due_date: values.dueDate,
        payment_date: values.paymentDate || null,
        description: values.description || null,
      };

      let error;
      
      if (expenseToEdit) {
        console.log("Updating court expense:", expenseData);
        const { error: updateError } = await supabase
          .from("court_expenses")
          .update(expenseData)
          .eq("id", expenseToEdit.id);
        error = updateError;
      } else {
        console.log("Creating new court expense:", expenseData);
        const { error: insertError } = await supabase
          .from("court_expenses")
          .insert(expenseData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: expenseToEdit ? "Despesa atualizada com sucesso!" : "Despesa registrada com sucesso!",
      });
      onClose();
    } catch (error) {
      console.error("Error saving court expense:", error);
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
          <DialogTitle>{expenseToEdit ? "Editar Despesa da Quadra" : "Nova Despesa da Quadra"}</DialogTitle>
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
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Vencimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Pagamento</FormLabel>
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
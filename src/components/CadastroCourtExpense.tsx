import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  valor: z.string().min(1, "Digite o valor"),
  mesAno: z.string().min(1, "Selecione o mês/ano"),
  dataPagamento: z.string().optional(),
  descricao: z.string().optional(),
});

interface CadastroCourtExpenseProps {
  onClose: () => void;
}

export function CadastroCourtExpense({ onClose }: CadastroCourtExpenseProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valor: "",
      mesAno: "",
      dataPagamento: "",
      descricao: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting court expense:", values);
      
      const [year, month] = values.mesAno.split("-");
      const dueDate = `${year}-${month}-01`;
      
      const expenseData = {
        amount: parseFloat(values.valor),
        due_date: dueDate,
        payment_date: values.dataPagamento || null,
        description: values.descricao || null,
      };

      console.log("Formatted expense data:", expenseData);

      const { error } = await supabase
        .from("court_expenses")
        .insert(expenseData);

      if (error) {
        console.error("Error saving court expense:", error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar despesa",
          description: "Ocorreu um erro ao tentar salvar a despesa da quadra. Tente novamente.",
        });
        return;
      }

      console.log("Court expense saved successfully");
      toast({
        title: "Despesa salva com sucesso!",
        description: "A despesa da quadra foi registrada no sistema.",
      });
      onClose();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar despesa",
        description: "Ocorreu um erro ao tentar salvar a despesa da quadra. Tente novamente.",
      });
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Nova Despesa da Quadra</DialogTitle>
          <DialogDescription>
            Preencha os dados da despesa da quadra abaixo
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="mesAno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mês/Ano</FormLabel>
                  <FormControl>
                    <Input type="month" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dataPagamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data do Pagamento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
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

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  aluno: z.string().min(1, "Selecione um aluno"),
  mesAno: z.string().min(1, "Selecione o mês/ano"),
  valor: z.string().min(1, "Digite o valor"),
  status: z.enum(["paid", "pending", "overdue"]),
  dataPagamento: z.string().optional(),
});

interface CadastroPagamentoProps {
  onClose: () => void;
}

export function CadastroPagamento({ onClose }: CadastroPagamentoProps) {
  const [students, setStudents] = useState<Tables<"students">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      aluno: "",
      mesAno: "",
      valor: "",
      status: "pending",
      dataPagamento: "",
    },
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        console.log("Fetching students for payment form...");
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .eq("active", true) // Apenas alunos ativos
          .order("name");

        if (error) {
          console.error("Error fetching students:", error);
          return;
        }

        console.log("Students fetched successfully:", data);
        setStudents(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting payment:", values);
      
      const [year, month] = values.mesAno.split("-");
      // Changed to use the 1st day of the selected month, instead of last day of previous month
      const dueDate = `${year}-${month}-01`;
      
      const paymentData = {
        student_id: values.aluno,
        amount: parseFloat(values.valor),
        due_date: dueDate,
        payment_date: values.status === "paid" ? values.dataPagamento : null,
        status: values.status,
      };

      console.log("Formatted payment data:", paymentData);

      const { error } = await supabase
        .from("payments")
        .insert(paymentData);

      if (error) {
        console.error("Error saving payment:", error);
        toast({
          variant: "destructive",
          title: "Erro ao salvar pagamento",
          description: "Ocorreu um erro ao tentar salvar o pagamento. Tente novamente.",
        });
        return;
      }

      console.log("Payment saved successfully");
      toast({
        title: "Pagamento salvo com sucesso!",
        description: "O pagamento foi registrado no sistema.",
      });
      onClose();
    } catch (error) {
      console.error("Error in onSubmit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar pagamento",
        description: "Ocorreu um erro ao tentar salvar o pagamento. Tente novamente.",
      });
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
          <DialogDescription>
            Preencha os dados do pagamento abaixo
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="aluno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aluno</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoading ? (
                        <SelectItem value="loading" disabled>Carregando alunos...</SelectItem>
                      ) : students.length === 0 ? (
                        <SelectItem value="no-students" disabled>Nenhum aluno ativo cadastrado</SelectItem>
                      ) : (
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="paid">Pago</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="overdue">Atrasado</SelectItem>
                    </SelectContent>
                  </Select>
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

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentData {
  student_name: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: "pending" | "paid" | "overdue";
}

export const PaymentHistory = () => {
  const { toast } = useToast();

  const { data: payments = [] } = useQuery({
    queryKey: ["payment-history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*, students(name)")
        .order("due_date", { ascending: false });

      return (
        data?.map((payment) => ({
          student_name: payment.students?.name || "N/A",
          amount: payment.amount,
          due_date: payment.due_date,
          payment_date: payment.payment_date,
          status: payment.status,
        })) || []
      );
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const exportData = () => {
    try {
      const csvContent = [
        ["Aluno", "Valor", "Vencimento", "Data Pagamento", "Status"],
        ...payments.map((payment) => [
          payment.student_name,
          formatCurrency(payment.amount),
          format(new Date(payment.due_date), "dd/MM/yyyy"),
          payment.payment_date
            ? format(new Date(payment.payment_date), "dd/MM/yyyy")
            : "N/A",
          payment.status === "paid"
            ? "Pago"
            : payment.status === "pending"
            ? "Pendente"
            : "Atrasado",
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", "historico_pagamentos.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Histórico de Pagamentos</CardTitle>
        <Button onClick={exportData} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Data Pagamento</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell>{payment.student_name}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>
                    {format(new Date(payment.due_date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {payment.payment_date
                      ? format(new Date(payment.payment_date), "dd/MM/yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        payment.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : payment.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {payment.status === "paid"
                        ? "Pago"
                        : payment.status === "pending"
                        ? "Pendente"
                        : "Atrasado"}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
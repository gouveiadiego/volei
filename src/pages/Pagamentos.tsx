import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { CadastroPagamento } from "@/components/CadastroPagamento";
import { CadastroCourtExpense } from "@/components/CadastroCourtExpense";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Payment {
  id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: "pending" | "paid" | "overdue";
  student: {
    name: string;
  };
}

interface CourtExpense {
  id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  description: string | null;
}

export default function Pagamentos() {
  const [showCadastro, setShowCadastro] = useState(false);
  const [showCourtExpense, setShowCourtExpense] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [courtExpenses, setCourtExpenses] = useState<CourtExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      console.log("Fetching payments...");
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          due_date,
          payment_date,
          status,
          student:students(name)
        `)
        .order("due_date", { ascending: false });

      if (error) {
        console.error("Error fetching payments:", error);
        return;
      }

      console.log("Payments fetched:", data);
      setPayments(data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchCourtExpenses = async () => {
    try {
      console.log("Fetching court expenses...");
      const { data, error } = await supabase
        .from("court_expenses")
        .select("*")
        .order("due_date", { ascending: false });

      if (error) {
        console.error("Error fetching court expenses:", error);
        return;
      }

      console.log("Court expenses fetched:", data);
      setCourtExpenses(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchCourtExpenses();
  }, []);

  const handlePaymentAdded = () => {
    setShowCadastro(false);
    fetchPayments();
  };

  const handleCourtExpenseAdded = () => {
    setShowCourtExpense(false);
    fetchCourtExpenses();
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasado";
      default:
        return status;
    }
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateMonthlyBalance = (month: string) => {
    const monthPayments = payments
      .filter(payment => payment.due_date.startsWith(month) && payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const monthExpenses = courtExpenses
      .filter(expense => expense.due_date.startsWith(month))
      .reduce((sum, expense) => sum + expense.amount, 0);

    return monthPayments - monthExpenses;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowCourtExpense(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Despesa da Quadra
          </Button>
          <Button onClick={() => setShowCadastro(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Despesas da Quadra</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mês/Ano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data do Pagamento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Saldo do Mês</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando despesas...
                  </TableCell>
                </TableRow>
              ) : courtExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhuma despesa registrada
                  </TableCell>
                </TableRow>
              ) : (
                courtExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{formatDate(expense.due_date)}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>
                      {expense.payment_date ? formatDate(expense.payment_date) : "-"}
                    </TableCell>
                    <TableCell>{expense.description || "-"}</TableCell>
                    <TableCell>
                      {formatCurrency(calculateMonthlyBalance(expense.due_date.substring(0, 7)))}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data do Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Carregando pagamentos...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum pagamento registrado
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.student.name}</TableCell>
                    <TableCell>{formatDate(payment.due_date)}</TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formatStatus(payment.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.payment_date ? formatDate(payment.payment_date) : "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showCadastro && <CadastroPagamento onClose={handlePaymentAdded} />}
      {showCourtExpense && <CadastroCourtExpense onClose={handleCourtExpenseAdded} />}
    </div>
  );
}
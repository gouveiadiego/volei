import { Toaster } from "@/components/ui/toaster";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CadastroPagamento } from "@/components/CadastroPagamento";
import { CadastroCourtExpense } from "@/components/CadastroCourtExpense";
import { CadastroAdditionalIncome } from "@/components/CadastroAdditionalIncome";
import { CadastroExpense } from "@/components/CadastroExpense";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

interface AdditionalIncome {
  id: string;
  amount: number;
  date: string;
  description: string;
}

interface ExtraExpense {
  id: string;
  amount: number;
  date: string;
  payment_date: string | null;
  description: string;
}

export default function Pagamentos() {
  const [showCadastro, setShowCadastro] = useState(false);
  const [showCourtExpense, setShowCourtExpense] = useState(false);
  const [showAdditionalIncome, setShowAdditionalIncome] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [courtExpenses, setCourtExpenses] = useState<CourtExpense[]>([]);
  const [additionalIncomes, setAdditionalIncomes] = useState<AdditionalIncome[]>([]);
  const [extraExpenses, setExtraExpenses] = useState<ExtraExpense[]>([]);
  const [expenseToEdit, setExpenseToEdit] = useState<ExtraExpense | undefined>();
  const [incomeToEdit, setIncomeToEdit] = useState<AdditionalIncome | undefined>();
  const [courtExpenseToEdit, setCourtExpenseToEdit] = useState<CourtExpense | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
      setPayments(data || []);
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
      setCourtExpenses(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchAdditionalIncomes = async () => {
    try {
      console.log("Fetching additional incomes...");
      const { data, error } = await supabase
        .from("additional_income")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching additional incomes:", error);
        return;
      }

      console.log("Additional incomes fetched:", data);
      setAdditionalIncomes(data || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchExtraExpenses = async () => {
    try {
      console.log("Fetching extra expenses...");
      const { data, error } = await supabase
        .from("extra_expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching extra expenses:", error);
        return;
      }

      console.log("Extra expenses fetched:", data);
      setExtraExpenses(data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchPayments(),
        fetchCourtExpenses(),
        fetchAdditionalIncomes(),
        fetchExtraExpenses()
      ]);
      setIsLoading(false);
    };
    
    fetchData();
  }, []);

  const handlePaymentAdded = () => {
    setShowCadastro(false);
    fetchPayments();
  };

  const handleCourtExpenseAdded = () => {
    setShowCourtExpense(false);
    setCourtExpenseToEdit(undefined);
    fetchCourtExpenses();
  };

  const handleAdditionalIncomeAdded = () => {
    setShowAdditionalIncome(false);
    setIncomeToEdit(undefined);
    fetchAdditionalIncomes();
  };

  const handleExpenseAdded = () => {
    setShowExpense(false);
    setExpenseToEdit(undefined);
    fetchExtraExpenses();
  };

  const handleEditIncome = (income: AdditionalIncome) => {
    setIncomeToEdit(income);
    setShowAdditionalIncome(true);
  };

  const handleEditCourtExpense = (expense: CourtExpense) => {
    setCourtExpenseToEdit(expense);
    setShowCourtExpense(true);
  };

  const handleEditExpense = (expense: ExtraExpense) => {
    setExpenseToEdit(expense);
    setShowExpense(true);
  };

  const handleDeleteIncome = async (id: string) => {
    try {
      console.log("Deleting additional income:", id);
      const { error } = await supabase
        .from("additional_income")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Receita removida com sucesso!",
      });
      fetchAdditionalIncomes();
    } catch (error) {
      console.error("Error deleting additional income:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover receita",
        description: "Por favor, tente novamente.",
      });
    }
  };

  const handleDeleteCourtExpense = async (id: string) => {
    try {
      console.log("Deleting court expense:", id);
      const { error } = await supabase
        .from("court_expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Despesa da quadra removida com sucesso!",
      });
      fetchCourtExpenses();
    } catch (error) {
      console.error("Error deleting court expense:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover despesa da quadra",
        description: "Por favor, tente novamente.",
      });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      console.log("Deleting extra expense:", id);
      const { error } = await supabase
        .from("extra_expenses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Despesa extra removida com sucesso!",
      });
      fetchExtraExpenses();
    } catch (error) {
      console.error("Error deleting extra expense:", error);
      toast({
        variant: "destructive",
        title: "Erro ao remover despesa extra",
        description: "Por favor, tente novamente.",
      });
    }
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

    const monthAdditionalIncomes = additionalIncomes
      .filter(income => income.date.startsWith(month))
      .reduce((sum, income) => sum + income.amount, 0);

    return monthPayments + monthAdditionalIncomes - monthExpenses;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Pagamentos</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
          <Button 
            onClick={() => setShowAdditionalIncome(true)}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Receita
          </Button>
          <Button 
            onClick={() => setShowCourtExpense(true)}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Nova Despesa Quadra
          </Button>
          <Button 
            onClick={() => setShowExpense(true)} 
            variant="destructive"
            className="w-full sm:w-auto"
          >
            <MinusCircle className="w-4 h-4 mr-2" />
            Nova Despesa Extra
          </Button>
          <Button 
            onClick={() => setShowCadastro(true)}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full rounded-md border">
              <div className="relative min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Data</TableHead>
                      <TableHead className="w-[100px]">Valor</TableHead>
                      <TableHead className="w-[200px]">Descrição</TableHead>
                      <TableHead className="w-[150px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {additionalIncomes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Nenhuma receita adicional registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      additionalIncomes.map((income) => (
                        <TableRow key={income.id}>
                          <TableCell>{formatDate(income.date)}</TableCell>
                          <TableCell>{formatCurrency(income.amount)}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {income.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditIncome(income)}
                                className="w-full sm:w-auto"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteIncome(income.id)}
                                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas da Quadra</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full rounded-md border">
              <div className="relative min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Mês/Ano</TableHead>
                      <TableHead className="w-[100px]">Valor</TableHead>
                      <TableHead className="w-[120px]">Data Pagamento</TableHead>
                      <TableHead className="w-[200px]">Descrição</TableHead>
                      <TableHead className="w-[100px]">Saldo Mês</TableHead>
                      <TableHead className="w-[150px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courtExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
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
                          <TableCell className="max-w-[200px] truncate">
                            {expense.description || "-"}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(calculateMonthlyBalance(expense.due_date.substring(0, 7)))}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCourtExpense(expense)}
                                className="w-full sm:w-auto"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCourtExpense(expense.id)}
                                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Despesas Extras</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full rounded-md border">
              <div className="relative min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Data</TableHead>
                      <TableHead className="w-[100px]">Valor</TableHead>
                      <TableHead className="w-[120px]">Data Pagamento</TableHead>
                      <TableHead className="w-[200px]">Descrição</TableHead>
                      <TableHead className="w-[150px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extraExpenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Nenhuma despesa extra registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      extraExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{formatDate(expense.date)}</TableCell>
                          <TableCell>{formatCurrency(expense.amount)}</TableCell>
                          <TableCell>
                            {expense.payment_date ? formatDate(expense.payment_date) : "-"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {expense.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditExpense(expense)}
                                className="w-full sm:w-auto"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="w-full rounded-md border">
              <div className="relative min-w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Aluno</TableHead>
                      <TableHead className="w-[100px]">Mês/Ano</TableHead>
                      <TableHead className="w-[100px]">Valor</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[120px]">Data Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Nenhum pagamento registrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.student.name}
                          </TableCell>
                          <TableCell>{formatDate(payment.due_date)}</TableCell>
                          <TableCell>{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs rounded-full ${
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
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {showCadastro && <CadastroPagamento onClose={handlePaymentAdded} />}
      {showCourtExpense && (
        <CadastroCourtExpense
          onClose={handleCourtExpenseAdded}
          expenseToEdit={courtExpenseToEdit}
        />
      )}
      {showAdditionalIncome && (
        <CadastroAdditionalIncome
          onClose={handleAdditionalIncomeAdded}
          incomeToEdit={incomeToEdit}
        />
      )}
      {showExpense && (
        <CadastroExpense
          onClose={handleExpenseAdded}
          expenseToEdit={expenseToEdit}
        />
      )}
    </div>
  );
}

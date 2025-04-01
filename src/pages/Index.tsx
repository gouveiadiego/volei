
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, TrendingUp, TrendingDown, DollarSign, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import StudentStatusList from "@/components/dashboard/StudentStatusList";
import FinancialOverview from "@/components/dashboard/FinancialOverview";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
    }
  };

  // Fetch total number of students
  const { data: studentsCount = 0 } = useQuery({
    queryKey: ["students-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });
      return count;
    },
  });

  // Fetch total payments received
  const { data: totalPayments = 0 } = useQuery({
    queryKey: ["payments-total"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "paid");
      return data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    },
  });

  // Fetch total additional income
  const { data: totalAdditionalIncome = 0 } = useQuery({
    queryKey: ["additional-income-total"],
    queryFn: async () => {
      const { data } = await supabase
        .from("additional_income")
        .select("amount");
      return data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
    },
  });

  // Fetch total expenses
  const { data: totalExpenses = 0 } = useQuery({
    queryKey: ["expenses-total"],
    queryFn: async () => {
      const { data: courtExpenses } = await supabase
        .from("court_expenses")
        .select("amount");
      const { data: extraExpenses } = await supabase
        .from("extra_expenses")
        .select("amount");
      
      const courtTotal = courtExpenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      const extraTotal = extraExpenses?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      
      return courtTotal + extraTotal;
    },
  });

  // Calculate total balance
  const totalBalance = (totalPayments + totalAdditionalIncome) - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formattedDate = format(new Date(), "EEEE, dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border border-slate-200 bg-white/50 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Alunos</p>
              <p className="text-2xl font-bold">{studentsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 bg-white/50 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-500/10 p-3 rounded-full">
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Receitas Totais</p>
              <p className="text-2xl font-bold text-emerald-500">
                {formatCurrency(totalPayments + totalAdditionalIncome)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 bg-white/50 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-red-500/10 p-3 rounded-full">
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Despesas Totais</p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 bg-white/50 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className={`${totalBalance >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'} p-3 rounded-full`}>
              <DollarSign className={`w-8 h-8 ${totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Saldo Total</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-slate-200 bg-white/50 shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/10 p-3 rounded-full">
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pagamentos Recebidos</p>
              <p className="text-2xl font-bold text-blue-500">
                {formatCurrency(totalPayments)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <StudentStatusList />
      </div>

      <FinancialOverview />
    </div>
  );
};

export default Index;

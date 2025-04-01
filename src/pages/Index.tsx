
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  LogOut,
  Calendar,
  LayoutDashboard
} from "lucide-react";
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
  const formattedDateCapitalized = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="space-y-6">
      {/* Header section with date and logout button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Dashboard</h1>
          <p className="text-muted-foreground">{formattedDateCapitalized}</p>
        </div>
        <Button
          variant="outline"
          onClick={handleLogout}
          className="gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-primary border-t border-r border-b bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Alunos</p>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold">{studentsCount}</p>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500 border-t border-r border-b bg-gradient-to-br from-white to-emerald-50 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Receitas</p>
              <div className="p-2 bg-emerald-500/10 rounded-full">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-emerald-500">
                {formatCurrency(totalPayments + totalAdditionalIncome)}
              </p>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-red-500 border-t border-r border-b bg-gradient-to-br from-white to-red-50 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Despesas</p>
              <div className="p-2 bg-red-500/10 rounded-full">
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(totalExpenses)}
              </p>
              <p className="text-xs text-muted-foreground">total</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 border-t border-r border-b bg-gradient-to-br from-white to-blue-50 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Saldo</p>
              <div className={`p-2 ${totalBalance >= 0 ? 'bg-blue-500/10' : 'bg-red-500/10'} rounded-full`}>
                <DollarSign className={`w-4 h-4 ${totalBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-xs text-muted-foreground">atual</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:inline-flex">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Alunos</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 pt-4">
          <FinancialOverview />
        </TabsContent>
        
        <TabsContent value="students" className="space-y-6 pt-4">
          <StudentStatusList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;

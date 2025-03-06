
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, TrendingUp, TrendingDown, DollarSign, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import StudentStatusList from "@/components/dashboard/StudentStatusList";

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

  // Fetch payment data for chart
  const { data: paymentsByMonth = [] } = useQuery({
    queryKey: ["payments-by-month"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("amount, payment_date, status")
        .order("payment_date");

      const monthlyData = data?.reduce((acc: any, payment) => {
        if (!payment.payment_date) return acc;
        const month = new Date(payment.payment_date).toLocaleString("default", {
          month: "short",
        });
        if (!acc[month]) {
          acc[month] = { paid: 0, pending: 0, overdue: 0 };
        }
        acc[month][payment.status] += Number(payment.amount);
        return acc;
      }, {});

      return Object.entries(monthlyData || {}).map(([month, values]: [string, any]) => ({
        month,
        ...values,
      }));
    },
  });

  // Financial overview data for pie chart
  const financialOverview = [
    { name: "Pagamentos", value: totalPayments },
    { name: "Receitas Extras", value: totalAdditionalIncome },
    { name: "Despesas", value: totalExpenses },
  ];

  const COLORS = ["#22C55E", "#3B82F6", "#EF4444"];

  const chartConfig = {
    paid: {
      label: "Pagos",
      theme: {
        light: "#22C55E",
        dark: "#22C55E",
      },
    },
    pending: {
      label: "Pendentes",
      theme: {
        light: "#EAB308",
        dark: "#EAB308",
      },
    },
    overdue: {
      label: "Atrasados",
      theme: {
        light: "#EF4444",
        dark: "#EF4444",
      },
    },
  };

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
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Total de Alunos</p>
              <p className="text-2xl font-bold">{studentsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-sm text-gray-500">Receitas Totais</p>
              <p className="text-2xl font-bold text-emerald-500">
                {formatCurrency(totalPayments + totalAdditionalIncome)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <TrendingDown className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Despesas Totais</p>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <DollarSign className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Saldo Total</p>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <CreditCard className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Pagamentos Recebidos</p>
              <p className="text-2xl font-bold">
                {formatCurrency(totalPayments)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <StudentStatusList />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pagamentos por Mês</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    formatCurrency(value)
                  }
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="paid" name="Pagos" stackId="a" fill="var(--color-paid)" />
                <Bar
                  dataKey="pending"
                  name="Pendentes"
                  stackId="a"
                  fill="var(--color-pending)"
                />
                <Bar
                  dataKey="overdue"
                  name="Atrasados"
                  stackId="a"
                  fill="var(--color-overdue)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Visão Geral Financeira</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialOverview}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {financialOverview.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;

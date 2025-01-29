import { Card } from "@/components/ui/card";
import { Users, CreditCard, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const Index = () => {
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

  // Fetch total attendance
  const { data: totalAttendance = 0 } = useQuery({
    queryKey: ["attendance-total"],
    queryFn: async () => {
      const { count } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("present", true);
      return count;
    },
  });

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

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>

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
            <CreditCard className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Pagamentos Recebidos</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(totalPayments)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Presenças Registradas</p>
              <p className="text-2xl font-bold">{totalAttendance}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pagamentos por Mês</h2>
          <div className="h-[400px]">
            <ChartContainer config={chartConfig}>
              <BarChart data={paymentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      notation: "compact",
                    }).format(value)
                  }
                />
                <ChartTooltip content={<ChartTooltipContent />} />
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
            </ChartContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
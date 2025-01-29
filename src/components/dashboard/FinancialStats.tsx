import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Legend,
  ReferenceLine,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const chartConfig = {
  income: {
    label: "Receitas",
    theme: {
      light: "#22C55E",
      dark: "#22C55E",
    },
  },
  expenses: {
    label: "Despesas",
    theme: {
      light: "#EF4444",
      dark: "#EF4444",
    },
  },
  balance: {
    label: "Saldo",
    theme: {
      light: "#3B82F6",
      dark: "#3B82F6",
    },
  },
};

export const FinancialStats = () => {
  const { data: financialData = [], isLoading } = useQuery({
    queryKey: ["financial-stats"],
    queryFn: async () => {
      console.log("Fetching financial data...");
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), i);
        return {
          start: format(startOfMonth(date), "yyyy-MM-dd"),
          end: format(endOfMonth(date), "yyyy-MM-dd"),
          month: format(date, "MMM", { locale: ptBR }),
          year: format(date, "yyyy"),
        };
      }).reverse();

      const monthlyData = await Promise.all(
        months.map(async ({ start, end, month, year }) => {
          // Pagamentos recebidos
          const { data: payments } = await supabase
            .from("payments")
            .select("amount")
            .eq("status", "paid")
            .gte("payment_date", start)
            .lte("payment_date", end);

          // Receitas adicionais
          const { data: additionalIncome } = await supabase
            .from("additional_income")
            .select("amount")
            .gte("date", start)
            .lte("date", end);

          // Despesas da quadra
          const { data: courtExpenses } = await supabase
            .from("court_expenses")
            .select("amount")
            .gte("payment_date", start)
            .lte("payment_date", end);

          // Despesas extras
          const { data: extraExpenses } = await supabase
            .from("extra_expenses")
            .select("amount")
            .gte("payment_date", start)
            .lte("date", end);

          const totalIncome =
            (payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0) +
            (additionalIncome?.reduce((sum, i) => sum + Number(i.amount), 0) || 0);

          const totalExpenses =
            (courtExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0) +
            (extraExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0);

          const balance = totalIncome - totalExpenses;

          return {
            month: `${month}/${year}`,
            income: totalIncome,
            expenses: totalExpenses,
            balance: balance,
          };
        })
      );

      console.log("Financial data fetched:", monthlyData);
      return monthlyData;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Comparativo Financeiro Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <p>Carregando dados financeiros...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Comparativo Financeiro Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={financialData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <ChartTooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={0} stroke="#666" />
              <Bar
                dataKey="income"
                name="Receitas"
                fill={chartConfig.income.theme.light}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expenses"
                name="Despesas"
                fill={chartConfig.expenses.theme.light}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="balance"
                name="Saldo"
                fill={chartConfig.balance.theme.light}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
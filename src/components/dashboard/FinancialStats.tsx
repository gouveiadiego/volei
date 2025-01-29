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
};

export const FinancialStats = () => {
  const { data: financialData = [] } = useQuery({
    queryKey: ["financial-stats"],
    queryFn: async () => {
      const months = Array.from({ length: 6 }, (_, i) => {
        const date = subMonths(new Date(), i);
        return {
          start: format(startOfMonth(date), "yyyy-MM-dd"),
          end: format(endOfMonth(date), "yyyy-MM-dd"),
          month: format(date, "MMM", { locale: ptBR }),
        };
      }).reverse();

      const monthlyData = await Promise.all(
        months.map(async ({ start, end, month }) => {
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
            .lte("payment_date", end);

          const totalIncome =
            (payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0) +
            (additionalIncome?.reduce((sum, i) => sum + Number(i.amount), 0) || 0);

          const totalExpenses =
            (courtExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0) +
            (extraExpenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0);

          return {
            month,
            income: totalIncome,
            expenses: totalExpenses,
          };
        })
      );

      return monthlyData;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Comparativo Financeiro Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ChartContainer config={chartConfig}>
            <BarChart data={financialData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar
                dataKey="income"
                name="Receitas"
                fill="var(--color-income)"
              />
              <Bar
                dataKey="expenses"
                name="Despesas"
                fill="var(--color-expenses)"
              />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};
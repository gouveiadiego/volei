import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

const FinancialStats = () => {
  const { data: paymentsByMonth = [] } = useQuery({
    queryKey: ["payments-by-month"],
    queryFn: async () => {
      const startDate = format(startOfMonth(subMonths(new Date(), 5)), "yyyy-MM-dd");
      
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, payment_date, status, due_date")
        .gte("due_date", startDate)
        .order("due_date");

      console.log("Fetched payments:", payments);

      const monthlyData = new Map();

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, "MMM", { locale: ptBR });
        monthlyData.set(monthKey, {
          month: monthKey,
          paid: 0,
          pending: 0,
          overdue: 0,
        });
      }

      payments?.forEach((payment) => {
        const monthKey = format(new Date(payment.due_date), "MMM", {
          locale: ptBR,
        });

        if (monthlyData.has(monthKey)) {
          const monthData = monthlyData.get(monthKey);
          
          if (payment.status === "paid") {
            monthData.paid += Number(payment.amount);
          } else if (payment.status === "pending") {
            monthData.pending += Number(payment.amount);
          } else if (payment.status === "overdue") {
            monthData.overdue += Number(payment.amount);
          }
        }
      });

      return Array.from(monthlyData.values());
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card className="p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4 text-green-600">Pagamentos por Mês</h2>
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={paymentsByMonth} 
            style={{ backgroundColor: 'white' }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#22C55E" 
              opacity={0.2} 
            />
            <XAxis 
              dataKey="month" 
              stroke="#22C55E"
              tick={{ fill: '#22C55E' }}
              axisLine={{ stroke: '#22C55E' }}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              stroke="#22C55E"
              tick={{ fill: '#22C55E' }}
              axisLine={{ stroke: '#22C55E' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #22C55E',
                borderRadius: '8px',
                color: '#22C55E'
              }}
              formatter={(value) => formatCurrency(Number(value))}
              labelStyle={{ color: '#22C55E' }}
              cursor={{ fill: '#22C55E', opacity: 0.1 }}
            />
            <Bar 
              dataKey="paid" 
              name="Pagos" 
              fill="#22C55E" 
              stackId="a" 
            />
            <Bar
              dataKey="pending"
              name="Pendentes"
              fill="#86EFAC"
              stackId="a"
            />
            <Bar
              dataKey="overdue"
              name="Atrasados"
              fill="#4ADE80"
              stackId="a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default FinancialStats;
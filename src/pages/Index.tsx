import { Card } from "@/components/ui/card";
import { Users, CreditCard, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AttendanceStats } from "@/components/dashboard/AttendanceStats";
import { FinancialStats } from "@/components/dashboard/FinancialStats";
import { PaymentHistory } from "@/components/dashboard/PaymentHistory";

const Index = () => {
  const today = format(new Date(), "yyyy-MM-dd");

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

  // Fetch today's attendance
  const { data: todayAttendance = 0 } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: async () => {
      const { count } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("class_date", today)
        .eq("present", true);
      return count;
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formattedDate = format(new Date(), "EEEE, dd 'de' MMMM", {
    locale: ptBR,
  });

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
                {formatCurrency(totalPayments)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Presenças Confirmadas</p>
              <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
              <p className="text-2xl font-bold">{todayAttendance}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AttendanceStats />
        <FinancialStats />
        <PaymentHistory />
      </div>
    </div>
  );
};

export default Index;
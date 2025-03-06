
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { BadgeCheck, BadgeAlert, CircleDot } from "lucide-react";

interface Student {
  id: string;
  name: string;
  payments: {
    status: "paid" | "pending" | "overdue";
    due_date: string;
  }[];
}

const StudentStatusList = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const lastMonth = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const isMobile = useIsMobile();
  
  // Format current month in Portuguese
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students-status"],
    queryFn: async () => {
      console.log("Fetching students status data...");
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select(`
          id,
          name,
          payments (
            status,
            due_date
          )
        `)
        .eq('active', true)
        .gte('payments.due_date', lastMonth)
        .lte('payments.due_date', today)
        .order('name');

      if (studentsError) {
        console.error("Error fetching students:", studentsError);
        throw studentsError;
      }

      console.log("Students data fetched:", studentsData);
      return studentsData as Student[];
    },
  });

  const getPaymentStatus = (student: Student) => {
    if (!student.payments || student.payments.length === 0) return "Sem pagamentos";
    
    const latestPayment = student.payments
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
    
    if (!latestPayment) return "Sem pagamentos";
    
    switch (latestPayment.status) {
      case "paid":
        return "Em dia";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Atrasado";
      default:
        return "Desconhecido";
    }
  };

  const shouldHighlightRed = (student: Student) => {
    if (!student.payments || student.payments.length === 0) return true;
    
    const latestPayment = student.payments
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
    
    return !latestPayment || latestPayment.status === "overdue";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em dia":
        return "text-green-500";
      case "Pendente":
        return "text-amber-500";
      case "Atrasado":
        return "text-red-500";
      default:
        return "text-red-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Em dia":
        return <BadgeCheck className="h-5 w-5 text-green-500" />;
      case "Pendente":
        return <CircleDot className="h-5 w-5 text-amber-500" />;
      case "Atrasado":
      default:
        return <BadgeAlert className="h-5 w-5 text-red-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="border border-slate-200 bg-white/50 shadow-md backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-center text-xl">Status dos Alunos</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary"></div>
            <p className="ml-2">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Card className="border border-slate-200 bg-white/50 shadow-md backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="text-center text-xl">Status dos Alunos</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3">
            {students.map((student) => {
              const paymentStatus = getPaymentStatus(student);
              const statusColor = getStatusColor(paymentStatus);
              const statusIcon = getStatusIcon(paymentStatus);
              const isUnpaid = shouldHighlightRed(student);

              return (
                <div 
                  key={student.id} 
                  className={`rounded-lg border p-3 transition-all duration-300 hover:shadow-md ${isUnpaid ? 'bg-red-50 border-red-200' : 'bg-white/70 hover:bg-white/90'}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${isUnpaid ? 'text-red-600' : 'text-slate-800'}`}>
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {statusIcon}
                      <span className={`text-sm font-medium ${statusColor}`}>{paymentStatus}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Pagamentos referentes a: <span className="font-medium">{capitalizedMonth}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200 bg-white/50 shadow-md backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="text-center text-xl">Status dos Alunos</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const paymentStatus = getPaymentStatus(student);
            const statusColor = getStatusColor(paymentStatus);
            const statusIcon = getStatusIcon(paymentStatus);
            const isUnpaid = shouldHighlightRed(student);

            return (
              <div 
                key={student.id} 
                className={`flex items-center justify-between rounded-lg border p-4 transition-all duration-300 hover:shadow-md ${isUnpaid ? 'bg-red-50 border-red-200' : 'bg-white/70 hover:bg-white/90'}`}
              >
                <h3 className={`font-medium ${isUnpaid ? 'text-red-600' : 'text-slate-800'}`}>
                  {student.name}
                </h3>
                <div className="flex items-center gap-2">
                  {statusIcon}
                  <span className={`text-sm font-medium ${statusColor}`}>{paymentStatus}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Pagamentos referentes a: <span className="font-medium">{capitalizedMonth}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentStatusList;

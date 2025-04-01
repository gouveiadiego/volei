
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { BadgeCheck, BadgeAlert, CircleDot, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  // Define março como mês específico para verificar pagamentos
  const targetMonth = '2024-03-01';
  const targetMonthEnd = '2024-03-31';
  
  // Format current month in Portuguese
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);
  
  // Format março in Portuguese
  const marcoMonth = format(parse('2024-03-01', 'yyyy-MM-dd', new Date()), 'MMMM yyyy', { locale: ptBR });
  const capitalizedMarcoMonth = marcoMonth.charAt(0).toUpperCase() + marcoMonth.slice(1);

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

  const getMarcoPaymentStatus = (student: Student) => {
    if (!student.payments || student.payments.length === 0) return "Sem pagamentos";
    
    // Filtrar pagamentos de março
    const marcoPayments = student.payments.filter(payment => {
      const paymentDate = new Date(payment.due_date);
      return paymentDate >= new Date(targetMonth) && paymentDate <= new Date(targetMonthEnd);
    });
    
    if (marcoPayments.length === 0) return "Sem pagamentos";
    
    // Pegar o status do pagamento de março
    const marcoPayment = marcoPayments[0];
    
    switch (marcoPayment.status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Não Pago";
      default:
        return "Sem informação";
    }
  };

  const shouldHighlightRed = (student: Student) => {
    if (!student.payments || student.payments.length === 0) return true;
    
    const latestPayment = student.payments
      .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];
    
    return !latestPayment || latestPayment.status === "overdue";
  };

  const didNotPayInMarch = (student: Student) => {
    if (!student.payments || student.payments.length === 0) return true;
    
    // Filtrar pagamentos de março
    const marcoPayments = student.payments.filter(payment => {
      const paymentDate = new Date(payment.due_date);
      return paymentDate >= new Date(targetMonth) && paymentDate <= new Date(targetMonthEnd);
    });
    
    if (marcoPayments.length === 0) return true;
    
    return marcoPayments[0].status !== "paid";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Em dia":
      case "Pago":
        return "text-green-500";
      case "Pendente":
        return "text-amber-500";
      case "Atrasado":
      case "Não Pago":
        return "text-red-500";
      default:
        return "text-red-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Em dia":
      case "Pago":
        return <BadgeCheck className="h-5 w-5 text-green-500" />;
      case "Pendente":
        return <CircleDot className="h-5 w-5 text-amber-500" />;
      case "Atrasado":
      case "Não Pago":
      default:
        return <BadgeAlert className="h-5 w-5 text-red-500" />;
    }
  };

  // Contar alunos que não pagaram em março
  const unpaidMarchCount = students.filter(student => didNotPayInMarch(student)).length;

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
          {unpaidMarchCount > 0 && (
            <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{unpaidMarchCount}</strong> {unpaidMarchCount === 1 ? 'aluno' : 'alunos'} não {unpaidMarchCount === 1 ? 'pagou' : 'pagaram'} em {capitalizedMarcoMonth}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 gap-3">
            {students.map((student) => {
              const paymentStatus = getPaymentStatus(student);
              const marcoStatus = getMarcoPaymentStatus(student);
              const statusColor = getStatusColor(paymentStatus);
              const statusIcon = getStatusIcon(paymentStatus);
              const isUnpaid = shouldHighlightRed(student);
              const unpaidInMarch = didNotPayInMarch(student);

              return (
                <div 
                  key={student.id} 
                  className={`rounded-lg border p-3 transition-all duration-300 hover:shadow-md ${
                    unpaidInMarch ? 'bg-red-50 border-red-200' : isUnpaid ? 'bg-amber-50 border-amber-200' : 'bg-white/70 hover:bg-white/90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-medium ${
                      unpaidInMarch ? 'text-red-600' : isUnpaid ? 'text-amber-600' : 'text-slate-800'
                    }`}>
                      {student.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      {statusIcon}
                      <span className={`text-sm font-medium ${statusColor}`}>{paymentStatus}</span>
                    </div>
                  </div>
                  {unpaidInMarch && (
                    <div className="text-xs flex items-center mt-1 text-red-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      <span>Março: {getStatusColor(marcoStatus) === "text-red-500" ? "Não pago" : marcoStatus}</span>
                    </div>
                  )}
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
        {unpaidMarchCount > 0 && (
          <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-sm">
              <strong>{unpaidMarchCount}</strong> {unpaidMarchCount === 1 ? 'aluno' : 'alunos'} não {unpaidMarchCount === 1 ? 'pagou' : 'pagaram'} em {capitalizedMarcoMonth}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => {
            const paymentStatus = getPaymentStatus(student);
            const marcoStatus = getMarcoPaymentStatus(student);
            const statusColor = getStatusColor(paymentStatus);
            const statusIcon = getStatusIcon(paymentStatus);
            const isUnpaid = shouldHighlightRed(student);
            const unpaidInMarch = didNotPayInMarch(student);

            return (
              <div 
                key={student.id} 
                className={`rounded-lg border p-4 transition-all duration-300 hover:shadow-md ${
                  unpaidInMarch ? 'bg-red-50 border-red-200' : isUnpaid ? 'bg-amber-50 border-amber-200' : 'bg-white/70 hover:bg-white/90'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-medium ${
                    unpaidInMarch ? 'text-red-600' : isUnpaid ? 'text-amber-600' : 'text-slate-800'
                  }`}>
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {statusIcon}
                    <span className={`text-sm font-medium ${statusColor}`}>{paymentStatus}</span>
                  </div>
                </div>
                {unpaidInMarch && (
                  <div className="text-xs flex items-center mt-2 text-red-600">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    <span>Março: {getStatusColor(marcoStatus) === "text-red-500" ? "Não pago" : marcoStatus}</span>
                  </div>
                )}
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

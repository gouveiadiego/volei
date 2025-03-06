
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

interface Student {
  id: string;
  name: string;
  payments: {
    status: "paid" | "pending" | "overdue";
    due_date: string;
  }[];
  attendance: {
    present: boolean;
    class_date: string;
  }[];
}

const StudentStatusList = () => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const lastMonth = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const isMobile = useIsMobile();

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
        return "text-green-600";
      case "Pendente":
        return "text-yellow-600";
      case "Atrasado":
        return "text-red-600";
      default:
        return "text-red-600"; // Sem pagamentos também será vermelho
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status dos Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <p>Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status dos Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {students.map((student) => {
                const paymentStatus = getPaymentStatus(student);
                const statusColor = getStatusColor(paymentStatus);
                const isUnpaid = shouldHighlightRed(student);

                return (
                  <Card key={student.id} className={`p-4 ${isUnpaid ? 'bg-red-50' : ''}`}>
                    <h3 className={`font-medium text-lg mb-2 ${isUnpaid ? 'text-red-600' : ''}`}>
                      {student.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">Status Pagamento:</span>
                        <span className={statusColor}>{paymentStatus}</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status dos Alunos</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Status Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const paymentStatus = getPaymentStatus(student);
                const statusColor = getStatusColor(paymentStatus);
                const isUnpaid = shouldHighlightRed(student);

                return (
                  <TableRow key={student.id} className={isUnpaid ? 'bg-red-50' : ''}>
                    <TableCell className={`font-medium ${isUnpaid ? 'text-red-600' : ''}`}>
                      {student.name}
                    </TableCell>
                    <TableCell className={statusColor}>{paymentStatus}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default StudentStatusList;

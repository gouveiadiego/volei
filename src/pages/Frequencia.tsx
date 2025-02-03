import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ptBR } from "date-fns/locale";

interface Student {
  id: string;
  name: string;
}

interface Attendance {
  id: string;
  student_id: string;
  class_date: string;
  present: boolean;
}

const Frequencia = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { data, error } = await supabase
          .from("students")
          .select("id, name")
          .eq("active", true);

        if (error) throw error;
        setStudents(data || []);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de alunos.",
          variant: "destructive",
        });
      }
    };

    fetchStudents();
  }, [toast]);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const formattedDate = format(date, "yyyy-MM-dd");
        const { data, error } = await supabase
          .from("attendance")
          .select("*")
          .eq("class_date", formattedDate);

        if (error) throw error;
        setAttendance(data || []);
      } catch (error) {
        console.error("Error fetching attendance:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de presença.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [date, toast]);

  const toggleAttendance = async (studentId: string) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    const existingRecord = attendance.find(
      (a) => a.student_id === studentId && a.class_date === formattedDate
    );

    try {
      if (existingRecord) {
        const { error } = await supabase
          .from("attendance")
          .update({ present: !existingRecord.present })
          .eq("id", existingRecord.id);

        if (error) throw error;

        setAttendance(
          attendance.map((a) =>
            a.id === existingRecord.id ? { ...a, present: !a.present } : a
          )
        );
      } else {
        const { data, error } = await supabase
          .from("attendance")
          .insert({
            student_id: studentId,
            class_date: formattedDate,
            present: true,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setAttendance([...attendance, data]);
        }
      }

      toast({
        title: "Sucesso",
        description: "Presença atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a presença.",
        variant: "destructive",
      });
    }
  };

  const getAttendanceStatus = (studentId: string) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    return attendance.find(
      (a) => a.student_id === studentId && a.class_date === formattedDate
    )?.present;
  };

  return (
    <div className="container mx-auto py-4 px-2 md:px-4 space-y-4">
      <Card className="border-0 shadow-none md:border md:shadow-sm">
        <CardHeader className="px-2 md:px-6">
          <CardTitle className="text-lg md:text-2xl">
            Lista de Presença - {format(date, "dd/MM/yyyy")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="order-2 md:order-1">
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Aluno</TableHead>
                        <TableHead className="w-[80px] text-center">Presença</TableHead>
                        <TableHead className="w-[100px]">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="text-center">
                            {getAttendanceStatus(student.id) ? (
                              <Check className="inline text-green-500" />
                            ) : (
                              <X className="inline text-red-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleAttendance(student.id)}
                              className="w-full whitespace-nowrap text-xs"
                            >
                              {getAttendanceStatus(student.id)
                                ? "Marcar Falta"
                                : "Marcar Presença"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </div>
            
            <div className="order-1 md:order-2">
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base md:text-lg">Calendário</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    className="rounded-md mx-auto"
                    locale={ptBR}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Frequencia;
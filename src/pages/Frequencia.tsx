import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

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

  // Fetch students
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

  // Fetch attendance for selected date
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
        // Update existing record
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
        // Create new record
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
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Controle de Frequência</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Presença - {format(date, "dd/MM/yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Presença</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>
                        {getAttendanceStatus(student.id) ? (
                          <Check className="text-green-500" />
                        ) : (
                          <X className="text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAttendance(student.id)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Frequencia;
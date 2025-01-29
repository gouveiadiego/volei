import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface AttendanceData {
  student_id: string;
  student_name: string;
  attendance_count: number;
  total_classes: number;
  consecutive_absences: number;
}

export const AttendanceStats = () => {
  const currentDate = new Date();
  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);

  const { data: attendanceStats = [] } = useQuery({
    queryKey: ["attendance-stats"],
    queryFn: async () => {
      const { data: students } = await supabase
        .from("students")
        .select("id, name")
        .eq("active", true);

      if (!students) return [];

      const attendancePromises = students.map(async (student) => {
        const { data: attendanceData } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", student.id)
          .gte("class_date", format(firstDayOfMonth, "yyyy-MM-dd"))
          .lte("class_date", format(lastDayOfMonth, "yyyy-MM-dd"));

        const { data: consecutiveAbsences } = await supabase
          .from("attendance")
          .select("*")
          .eq("student_id", student.id)
          .eq("present", false)
          .order("class_date", { ascending: false })
          .limit(30);

        const totalClasses = attendanceData?.length || 0;
        const presentCount = attendanceData?.filter((a) => a.present)?.length || 0;
        
        return {
          student_id: student.id,
          student_name: student.name,
          attendance_count: presentCount,
          total_classes: totalClasses,
          consecutive_absences: consecutiveAbsences?.length || 0,
        };
      });

      return Promise.all(attendancePromises);
    },
  });

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Estatísticas de Presença - {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Presenças</TableHead>
                <TableHead>Total de Aulas</TableHead>
                <TableHead>Percentual</TableHead>
                <TableHead>Faltas Consecutivas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceStats.map((stat) => (
                <TableRow key={stat.student_id}>
                  <TableCell>{stat.student_name}</TableCell>
                  <TableCell>{stat.attendance_count}</TableCell>
                  <TableCell>{stat.total_classes}</TableCell>
                  <TableCell>
                    {stat.total_classes > 0
                      ? `${Math.round((stat.attendance_count / stat.total_classes) * 100)}%`
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    {stat.consecutive_absences > 2 ? (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        {stat.consecutive_absences}
                      </div>
                    ) : (
                      stat.consecutive_absences
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserMinus, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { StudentWithInactiveInfo } from "@/types/student";

const InactiveStudentsSummary = () => {
  // Fetch inactive students
  const { data: inactiveStudents = [], isLoading } = useQuery({
    queryKey: ["inactive-students"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("active", false)
        .order("inactive_date", { ascending: false });

      if (error) throw error;
      return data as StudentWithInactiveInfo[];
    },
  });

  // Fetch total students for calculating retention rate
  const { data: totalStudentsCount = 0 } = useQuery({
    queryKey: ["total-students-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("students")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Calculate retention statistics
  const inactiveCount = inactiveStudents.length;
  const activeCount = totalStudentsCount - inactiveCount;
  const retentionRate = totalStudentsCount ? Math.round((activeCount / totalStudentsCount) * 100) : 0;

  // Get recent inactive students (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentInactiveStudents = inactiveStudents.filter(
    student => student.inactive_date && new Date(student.inactive_date) >= thirtyDaysAgo
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alunos Inativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <p>Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <UserMinus className="mr-2 h-5 w-5 text-muted-foreground" />
          Alunos Inativos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Taxa de Retenção</div>
              <div className="text-2xl font-bold">{retentionRate}%</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Ativos</div>
              <div className="text-2xl font-bold">{activeCount}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-sm font-medium text-muted-foreground">Inativos</div>
              <div className="text-2xl font-bold">{inactiveCount}</div>
            </div>
          </div>

          {/* Alertas de alunos recentes inativos */}
          {recentInactiveStudents.length > 0 && (
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertDescription>
                <strong>{recentInactiveStudents.length} aluno(s)</strong> ficaram inativos nos últimos 30 dias
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de alunos inativos recentes */}
          {inactiveStudents.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {inactiveStudents.slice(0, 5).map(student => (
                <div key={student.id} className="flex justify-between items-center p-3 border rounded-md">
                  <div>
                    <div className="font-medium">{student.name}</div>
                    {student.inactive_date && (
                      <div className="text-sm text-muted-foreground">
                        Inativo desde: {formatDate(student.inactive_date)}
                      </div>
                    )}
                  </div>
                  <div className="text-sm max-w-[200px] truncate text-muted-foreground">
                    {student.inactive_reason}
                  </div>
                </div>
              ))}
              {inactiveStudents.length > 5 && (
                <div className="text-sm text-muted-foreground text-center pt-2">
                  + {inactiveStudents.length - 5} outros alunos inativos
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              Não há alunos inativos no momento
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InactiveStudentsSummary;


import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Filter, Edit, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { CadastroAluno } from "@/components/CadastroAluno";
import { EditarAluno } from "@/components/EditarAluno";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function Alunos() {
  const [showForm, setShowForm] = useState(false);
  const [editAluno, setEditAluno] = useState<Tables<"students"> | null>(null);
  const [alunos, setAlunos] = useState<Tables<"students">[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "ativos" | "inativos">("ativos");

  const fetchAlunos = async () => {
    try {
      console.log("Fetching students...");
      let query = supabase.from("students").select("*").order("name");
      
      // Aplicar filtro se não for "todos"
      if (filtro === "ativos") {
        query = query.eq("active", true);
      } else if (filtro === "inativos") {
        query = query.eq("active", false);
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching students:", error);
        return;
      }

      console.log("Students fetched:", data);
      setAlunos(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [filtro]);

  const handleStudentAdded = () => {
    console.log("Student added, refreshing list...");
    fetchAlunos();
    setShowForm(false);
  };

  const handleEditarAluno = (aluno: Tables<"students">) => {
    setEditAluno(aluno);
  };

  const handleEditClosed = () => {
    setEditAluno(null);
    fetchAlunos();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Alunos</h1>
        <div className="flex gap-2">
          <Tabs defaultValue="ativos" onValueChange={(value) => setFiltro(value as any)}>
            <TabsList>
              <TabsTrigger value="ativos">
                <Eye className="w-4 h-4 mr-2" />
                Ativos
              </TabsTrigger>
              <TabsTrigger value="inativos">
                <EyeOff className="w-4 h-4 mr-2" />
                Inativos
              </TabsTrigger>
              <TabsTrigger value="todos">
                <Filter className="w-4 h-4 mr-2" />
                Todos
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Aluno
          </Button>
        </div>
      </div>

      {showForm ? (
        <Card className="p-6">
          <CadastroAluno onClose={handleStudentAdded} />
        </Card>
      ) : null}

      {editAluno && (
        <EditarAluno aluno={editAluno} onClose={handleEditClosed} />
      )}

      <Card className="p-6">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando alunos...</p>
        ) : alunos.length === 0 ? (
          <p className="text-muted-foreground">
            {filtro === "ativos" 
              ? "Nenhum aluno ativo encontrado."
              : filtro === "inativos"
                ? "Nenhum aluno inativo encontrado."
                : "Nenhum aluno cadastrado."}
          </p>
        ) : (
          <div className="space-y-4">
            {alunos.map((aluno) => (
              <div
                key={aluno.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{aluno.name}</h3>
                    <Badge variant={aluno.active ? "success" : "destructive"} className="text-xs">
                      {aluno.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{aluno.email}</p>
                  <p className="text-sm text-muted-foreground">{aluno.phone}</p>
                  {!aluno.active && aluno.inactive_reason && (
                    <p className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">Motivo:</span> {aluno.inactive_reason}
                    </p>
                  )}
                  {!aluno.active && aluno.inactive_date && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Inativo desde:</span> {new Date(aluno.inactive_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <div>
                  <Button variant="ghost" size="sm" onClick={() => handleEditarAluno(aluno)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

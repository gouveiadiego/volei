import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { CadastroAluno } from "@/components/CadastroAluno";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export default function Alunos() {
  const [showForm, setShowForm] = useState(false);
  const [alunos, setAlunos] = useState<Tables<"students">[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlunos = async () => {
    try {
      console.log("Fetching students...");
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("name");

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
  }, []);

  const handleStudentAdded = () => {
    console.log("Student added, refreshing list...");
    fetchAlunos();
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Alunos</h1>
        <Button onClick={() => setShowForm(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      {showForm ? (
        <Card className="p-6">
          <CadastroAluno onClose={handleStudentAdded} />
        </Card>
      ) : null}

      <Card className="p-6">
        {isLoading ? (
          <p className="text-muted-foreground">Carregando alunos...</p>
        ) : alunos.length === 0 ? (
          <p className="text-muted-foreground">Nenhum aluno cadastrado.</p>
        ) : (
          <div className="space-y-4">
            {alunos.map((aluno) => (
              <div
                key={aluno.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{aluno.name}</h3>
                  <p className="text-sm text-muted-foreground">{aluno.email}</p>
                  <p className="text-sm text-muted-foreground">{aluno.phone}</p>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      aluno.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {aluno.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
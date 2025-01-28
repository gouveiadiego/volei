import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { CadastroAluno } from "@/components/CadastroAluno";

export default function Alunos() {
  const [showForm, setShowForm] = useState(false);

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
          <CadastroAluno onClose={() => setShowForm(false)} />
        </Card>
      ) : null}

      <Card className="p-6">
        <p className="text-muted-foreground">Nenhum aluno cadastrado.</p>
      </Card>
    </div>
  );
}
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const Frequencia = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Dados mockados para exemplo
  const alunos = [
    { id: 1, nome: "João Silva", presente: true },
    { id: 2, nome: "Maria Santos", presente: false },
    { id: 3, nome: "Pedro Oliveira", presente: true },
  ];

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
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Presença</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Presença</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alunos.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell>{aluno.nome}</TableCell>
                    <TableCell>
                      {aluno.presente ? (
                        <Check className="text-green-500" />
                      ) : (
                        <X className="text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Alterar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Frequencia;
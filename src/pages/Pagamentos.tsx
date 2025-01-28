import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { CadastroPagamento } from "@/components/CadastroPagamento";

export default function Pagamentos() {
  const [showCadastro, setShowCadastro] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Pagamentos</h1>
        <Button onClick={() => setShowCadastro(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Novo Pagamento
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Mês/Ano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data do Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Ainda não há pagamentos registrados</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {showCadastro && <CadastroPagamento onClose={() => setShowCadastro(false)} />}
    </div>
  );
}
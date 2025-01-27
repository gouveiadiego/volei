import { Card } from "@/components/ui/card";
import { Users, CreditCard, Calendar } from "lucide-react";

const Index = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Total de Alunos</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <CreditCard className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Pagamentos Recebidos</p>
              <p className="text-2xl font-bold">R$ 0,00</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-gray-500">Aulas Realizadas</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Pagamentos do Mês</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de Pagamentos
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Frequência por Aluno</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            Gráfico de Frequência
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;
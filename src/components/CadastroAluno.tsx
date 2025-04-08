
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  status: z.enum(["ativo", "inativo"]),
  inativo_motivo: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CadastroAlunoProps {
  onClose: () => void;
}

export function CadastroAluno({ onClose }: CadastroAlunoProps) {
  const { toast } = useToast();
  const [mostrarCamposInativo, setMostrarCamposInativo] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefone: "",
      status: "ativo",
      inativo_motivo: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log("Submitting student data:", data);
    
    try {
      const { error } = await supabase.from("students").insert({
        name: data.nome,
        email: data.email,
        phone: data.telefone,
        active: data.status === "ativo",
        inactive_reason: data.status === "inativo" ? data.inativo_motivo : null,
        inactive_date: data.status === "inativo" ? new Date().toISOString().split('T')[0] : null,
      });

      if (error) {
        console.error("Error inserting student:", error);
        toast({
          title: "Erro ao cadastrar aluno",
          description: "Ocorreu um erro ao salvar os dados do aluno.",
          variant: "destructive",
        });
        return;
      }

      console.log("Student inserted successfully");
      toast({
        title: "Aluno cadastrado com sucesso!",
        description: `${data.nome} foi adicionado à lista de alunos.`,
      });

      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro ao cadastrar aluno",
        description: "Ocorreu um erro ao salvar os dados do aluno.",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = (value: string) => {
    setMostrarCamposInativo(value === "inativo");
    form.setValue("status", value as "ativo" | "inativo");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Cadastrar Novo Aluno</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o nome do aluno" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Digite o email do aluno"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Digite o telefone do aluno"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={handleStatusChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {mostrarCamposInativo && (
            <FormField
              control={form.control}
              name="inativo_motivo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo da Inativação</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite o motivo da inativação"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

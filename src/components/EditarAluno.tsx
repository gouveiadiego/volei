
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { StudentWithInactiveInfo } from "@/types/student";

const formSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").nullable().optional(),
  telefone: z.string().nullable().optional(),
  status: z.enum(["ativo", "inativo"]),
  inativo_motivo: z.string().nullable().optional(),
  inativo_data: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface EditarAlunoProps {
  aluno: StudentWithInactiveInfo;
  onClose: () => void;
}

export function EditarAluno({ aluno, onClose }: EditarAlunoProps) {
  const { toast } = useToast();
  const [mostrarCamposInativo, setMostrarCamposInativo] = useState(!aluno.active);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: aluno.name,
      email: aluno.email || "",
      telefone: aluno.phone || "",
      status: aluno.active ? "ativo" : "inativo",
      inativo_motivo: aluno.inactive_reason || "",
      inativo_data: aluno.inactive_date ? new Date(aluno.inactive_date).toISOString().split('T')[0] : "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log("Enviando dados atualizados do aluno:", data);
    
    try {
      const { error } = await supabase
        .from("students")
        .update({
          name: data.nome,
          email: data.email,
          phone: data.telefone,
          active: data.status === "ativo",
          inactive_reason: data.status === "inativo" ? data.inativo_motivo : null,
          inactive_date: data.status === "inativo" ? data.inativo_data : null,
        })
        .eq("id", aluno.id);

      if (error) {
        console.error("Erro ao atualizar aluno:", error);
        toast({
          title: "Erro ao atualizar aluno",
          description: "Ocorreu um erro ao salvar os dados do aluno.",
          variant: "destructive",
        });
        return;
      }

      console.log("Aluno atualizado com sucesso");
      toast({
        title: "Aluno atualizado com sucesso!",
        description: `Os dados de ${data.nome} foram atualizados.`,
      });

      onClose();
    } catch (error) {
      console.error("Erro:", error);
      toast({
        title: "Erro ao atualizar aluno",
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
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Aluno</DialogTitle>
        </DialogHeader>

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
                      value={field.value || ""}
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
                      value={field.value || ""}
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
              <>
                <FormField
                  control={form.control}
                  name="inativo_data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Inativação</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
              </>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

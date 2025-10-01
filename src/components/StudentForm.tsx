import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  curso: z.string().min(2, "Curso deve ter pelo menos 2 caracteres").max(100, "Curso deve ter no máximo 100 caracteres"),
  matricula: z.string().min(3, "Matrícula deve ter pelo menos 3 caracteres").max(50, "Matrícula deve ter no máximo 50 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;

interface StudentFormProps {
  student?: {
    id: string;
    nome: string;
    data_nascimento: string;
    curso: string;
    matricula: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export function StudentForm({ student, onSuccess, onCancel }: StudentFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: student?.nome || "",
      data_nascimento: student?.data_nascimento || "",
      curso: student?.curso || "",
      matricula: student?.matricula || "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const studentData = {
        nome: values.nome,
        data_nascimento: values.data_nascimento,
        curso: values.curso,
        matricula: values.matricula,
      };

      if (student) {
        // Update existing student
        const { error } = await supabase
          .from("alunos")
          .update(studentData)
          .eq("id", student.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Aluno atualizado com sucesso.",
        });
      } else {
        // Create new student
        const { error } = await supabase
          .from("alunos")
          .insert([studentData]);

        if (error) {
          if (error.code === "23505") {
            toast({
              title: "Erro",
              description: "Matrícula já existe. Por favor, use uma matrícula única.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }

        toast({
          title: "Sucesso!",
          description: "Aluno cadastrado com sucesso.",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao salvar o aluno.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo</FormLabel>
              <FormControl>
                <Input placeholder="João Silva" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data_nascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="curso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Curso</FormLabel>
              <FormControl>
                <Input placeholder="Engenharia de Software" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="matricula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula</FormLabel>
              <FormControl>
                <Input 
                  placeholder="2024001" 
                  {...field} 
                  disabled={!!student}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            {student ? "Atualizar" : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

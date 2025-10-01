import { useState, useEffect } from "react";
import { GraduationCap, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentForm } from "@/components/StudentForm";
import { StudentTable } from "@/components/StudentTable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Student {
  id: string;
  nome: string;
  data_nascimento: string;
  curso: string;
  matricula: string;
}

const Index = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<string[]>([]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("alunos")
        .select("*")
        .order("nome");

      if (error) throw error;

      setStudents(data || []);
      
      // Extract unique courses
      const uniqueCourses = Array.from(new Set(data?.map(s => s.curso) || []));
      setCourses(uniqueCourses);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((student) =>
        student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.matricula.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (courseFilter !== "all") {
      filtered = filtered.filter((student) => student.curso === courseFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, courseFilter]);

  const handleAddClick = () => {
    setEditingStudent(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setDialogOpen(false);
    setEditingStudent(undefined);
    fetchStudents();
  };

  const handleFormCancel = () => {
    setDialogOpen(false);
    setEditingStudent(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <GraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Controle de Alunos
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sistema de gerenciamento acadêmico
                </p>
              </div>
            </div>
            <Button onClick={handleAddClick} className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Aluno
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-card rounded-lg border p-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <div className="bg-card rounded-lg border p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Total de Alunos
            </div>
            <div className="text-3xl font-bold text-foreground">
              {students.length}
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Cursos Ativos
            </div>
            <div className="text-3xl font-bold text-foreground">
              {courses.length}
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Resultados
            </div>
            <div className="text-3xl font-bold text-foreground">
              {filteredStudents.length}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <StudentTable
            students={filteredStudents}
            onEdit={handleEditClick}
            onDelete={fetchStudents}
          />
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingStudent ? "Editar Aluno" : "Adicionar Novo Aluno"}
            </DialogTitle>
            <DialogDescription>
              {editingStudent
                ? "Atualize as informações do aluno abaixo."
                : "Preencha os dados do novo aluno."}
            </DialogDescription>
          </DialogHeader>
          <StudentForm
            student={editingStudent}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;

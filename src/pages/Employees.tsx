
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const Employees = () => {
  const [employees, setEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("leads")
        .select("employee")
        .eq("user_id", user?.id)
        .not("employee", "is", null)
        .order("employee");

      if (error) throw error;

      if (data) {
        // Get unique employee names and filter out any null or empty values
        const uniqueEmployees = [...new Set(data.map(item => item.employee).filter(Boolean))];
        setEmployees(uniqueEmployees);
      }
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast.error(`Erro ao carregar funcionários: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployeeName.trim()) {
      toast.error("O nome do funcionário não pode estar vazio");
      return;
    }

    try {
      setLoading(true);

      // Create a placeholder lead with the employee name
      // This is a workaround since we're storing employees as values in leads
      const { error } = await supabase
        .from("leads")
        .insert({
          name: `Placeholder for ${newEmployeeName}`,
          employee: newEmployeeName,
          user_id: user?.id,
          status: "novo"
        });

      if (error) throw error;

      toast.success(`Funcionário ${newEmployeeName} adicionado com sucesso`);
      setNewEmployeeName("");
      fetchEmployees();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast.error(`Erro ao adicionar funcionário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteEmployee = (employee: string) => {
    setEmployeeToDelete(employee);
    setDialogOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      setLoading(true);

      // Update all leads with this employee to have employee=null
      const { error } = await supabase
        .from("leads")
        .update({ employee: null })
        .eq("employee", employeeToDelete)
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success(`Funcionário ${employeeToDelete} removido com sucesso`);
      setDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      console.error("Error removing employee:", error);
      toast.error(`Erro ao remover funcionário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 transition-all duration-300">
        <Header />
        <main className="container mx-auto space-y-8 p-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Gerenciamento de Funcionários</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Nome do novo funcionário"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleAddEmployee} 
              disabled={loading || !newEmployeeName.trim()}
            >
              Adicionar Funcionário
            </Button>
          </div>

          {loading && <div className="text-center py-4">Carregando...</div>}

          {!loading && employees.length === 0 ? (
            <div className="bg-muted/50 p-8 text-center rounded-md">
              <h3 className="font-medium text-lg mb-2">Nenhum funcionário cadastrado</h3>
              <p className="text-muted-foreground">
                Adicione funcionários para atribuí-los a leads e comissões
              </p>
            </div>
          ) : (
            <Table>
              <TableCaption>Lista de funcionários cadastrados</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Funcionário</TableHead>
                  <TableHead className="w-[150px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee}>
                    <TableCell>{employee}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => confirmDeleteEmployee(employee)}
                        disabled={loading}
                      >
                        Remover
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja remover o funcionário "{employeeToDelete}"? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteEmployee}
                  disabled={loading}
                >
                  Confirmar exclusão
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default Employees;

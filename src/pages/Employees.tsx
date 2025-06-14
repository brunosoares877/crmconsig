import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { getEmployees, createEmployee, deleteEmployee, Employee } from "@/utils/employees";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeFullName, setNewEmployeeFullName] = useState("");
  const [newEmployeeBank, setNewEmployeeBank] = useState("");
  const [newEmployeePixKeyMain, setNewEmployeePixKeyMain] = useState("");
  const [newEmployeePixKey2, setNewEmployeePixKey2] = useState("");
  const [newEmployeePixKey3, setNewEmployeePixKey3] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchEmployees();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
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

    if (!newEmployeeFullName.trim()) {
      toast.error("O nome completo não pode estar vazio");
      return;
    }

    if (!newEmployeeBank.trim()) {
      toast.error("O banco não pode estar vazio");
      return;
    }

    if (!newEmployeePixKeyMain.trim()) {
      toast.error("A chave PIX principal é obrigatória");
      return;
    }

    try {
      setLoading(true);

      const success = await createEmployee(
        newEmployeeName,
        newEmployeeFullName,
        newEmployeeBank,
        newEmployeePixKeyMain,
        newEmployeePixKey2,
        newEmployeePixKey3
      );

      if (success) {
        toast.success(`Funcionário ${newEmployeeName} adicionado com sucesso`);
        setNewEmployeeName("");
        setNewEmployeeFullName("");
        setNewEmployeeBank("");
        setNewEmployeePixKeyMain("");
        setNewEmployeePixKey2("");
        setNewEmployeePixKey3("");
        fetchEmployees();
      } else {
        toast.error("Erro ao adicionar funcionário");
      }
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast.error(`Erro ao adicionar funcionário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteEmployee = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDialogOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      setLoading(true);

      const success = await deleteEmployee(employeeToDelete.id);

      if (success) {
        toast.success(`Funcionário ${employeeToDelete.name} removido com sucesso`);
        setDialogOpen(false);
        setEmployeeToDelete(null);
        fetchEmployees();
      } else {
        toast.error("Erro ao remover funcionário");
      }
    } catch (error: any) {
      console.error("Error removing employee:", error);
      toast.error(`Erro ao remover funcionário: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex w-full">
        <AppSidebar />
        <div className="flex-1 transition-all duration-300">
          <Header />
          <main className="container mx-auto space-y-8 p-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Gerenciamento de Funcionários</h1>

            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Adicionar Novo Funcionário</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nome do funcionário"
                    value={newEmployeeName}
                    onChange={(e) => setNewEmployeeName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">Nome Completo *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nome completo do funcionário"
                    value={newEmployeeFullName}
                    onChange={(e) => setNewEmployeeFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="bank">Banco *</Label>
                  <Input
                    id="bank"
                    type="text"
                    placeholder="Nome do banco"
                    value={newEmployeeBank}
                    onChange={(e) => setNewEmployeeBank(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="pixMain">Chave PIX Principal *</Label>
                  <Input
                    id="pixMain"
                    type="text"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    value={newEmployeePixKeyMain}
                    onChange={(e) => setNewEmployeePixKeyMain(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="pix2">Chave PIX 2 (opcional)</Label>
                  <Input
                    id="pix2"
                    type="text"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    value={newEmployeePixKey2}
                    onChange={(e) => setNewEmployeePixKey2(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor="pix3">Chave PIX 3 (opcional)</Label>
                  <Input
                    id="pix3"
                    type="text"
                    placeholder="CPF, e-mail, telefone ou chave aleatória"
                    value={newEmployeePixKey3}
                    onChange={(e) => setNewEmployeePixKey3(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button 
                    onClick={handleAddEmployee} 
                    disabled={loading || !newEmployeeName.trim() || !newEmployeeFullName.trim() || !newEmployeeBank.trim() || !newEmployeePixKeyMain.trim()}
                    className="w-full"
                  >
                    {loading ? "Adicionando..." : "Adicionar Funcionário"}
                  </Button>
                </div>
              </div>
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
                    <TableHead>Nome</TableHead>
                    <TableHead>Nome Completo</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Chave PIX Principal</TableHead>
                    <TableHead>Chave PIX 2</TableHead>
                    <TableHead>Chave PIX 3</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="w-[150px] text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.full_name || "-"}</TableCell>
                      <TableCell>{employee.bank || "-"}</TableCell>
                      <TableCell>{employee.pix_key_main || "-"}</TableCell>
                      <TableCell>{employee.pix_key_2 || "-"}</TableCell>
                      <TableCell>{employee.pix_key_3 || "-"}</TableCell>
                      <TableCell>{new Date(employee.created_at).toLocaleDateString()}</TableCell>
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
                    Tem certeza que deseja remover o funcionário "{employeeToDelete?.name}"? Esta ação não pode ser desfeita.
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
                    {loading ? "Removendo..." : "Confirmar exclusão"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Employees;

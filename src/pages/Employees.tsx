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
import { Edit } from "lucide-react";
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, Employee } from "@/utils/employees";
import { getBankName } from "@/utils/bankUtils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState("");
  const [newEmployeeBank, setNewEmployeeBank] = useState("");
  const [newEmployeePixKeyMain, setNewEmployeePixKeyMain] = useState("");
  const [newEmployeePixKey2, setNewEmployeePixKey2] = useState("");
  const [newEmployeePixKey3, setNewEmployeePixKey3] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [editEmployeeName, setEditEmployeeName] = useState("");
  const [editEmployeeBank, setEditEmployeeBank] = useState("");
  const [editEmployeePixKeyMain, setEditEmployeePixKeyMain] = useState("");
  const [editEmployeePixKey2, setEditEmployeePixKey2] = useState("");
  const [editEmployeePixKey3, setEditEmployeePixKey3] = useState("");
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

    // Verificar se já existe funcionário com o mesmo nome (case insensitive)
    const nomeExiste = employees.some(emp => emp.name.trim().toLowerCase() === newEmployeeName.trim().toLowerCase() && emp.active);
    if (nomeExiste) {
      toast.error("Já existe um funcionário com esse nome. Escolha um nome diferente.");
      return;
    }

    try {
      setLoading(true);

      const success = await createEmployee(
        newEmployeeName,
        newEmployeeName, // Using name as full_name since we removed the separate field
        newEmployeeBank,
        newEmployeePixKeyMain,
        newEmployeePixKey2,
        newEmployeePixKey3
      );

      if (success) {
        toast.success(`Funcionário ${newEmployeeName} adicionado com sucesso`);
        setNewEmployeeName("");
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

  const openEditDialog = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setEditEmployeeName(employee.name);
    setEditEmployeeBank(employee.bank || "");
    setEditEmployeePixKeyMain(employee.pix_key_main || "");
    setEditEmployeePixKey2(employee.pix_key_2 || "");
    setEditEmployeePixKey3(employee.pix_key_3 || "");
    setEditDialogOpen(true);
  };

  const handleEditEmployee = async () => {
    if (!employeeToEdit || !editEmployeeName.trim()) {
      toast.error("O nome do funcionário não pode estar vazio");
      return;
    }

    // Verificar se já existe funcionário com o mesmo nome (case insensitive), exceto o próprio
    const nomeExiste = employees.some(emp => emp.name.trim().toLowerCase() === editEmployeeName.trim().toLowerCase() && emp.id !== employeeToEdit.id && emp.active);
    if (nomeExiste) {
      toast.error("Já existe um funcionário com esse nome. Escolha um nome diferente.");
      return;
    }

    try {
      setLoading(true);

      const success = await updateEmployee(
        employeeToEdit.id,
        editEmployeeName,
        editEmployeeName, // Using name as full_name
        editEmployeeBank,
        editEmployeePixKeyMain,
        editEmployeePixKey2,
        editEmployeePixKey3
      );

      if (success) {
        toast.success(`Funcionário ${editEmployeeName} atualizado com sucesso`);
        setEditDialogOpen(false);
        setEmployeeToEdit(null);
        fetchEmployees();
      } else {
        toast.error("Erro ao atualizar funcionário");
      }
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(`Erro ao atualizar funcionário: ${error.message}`);
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
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 w-full flex">
        <AppSidebar />
        <div className="flex-1 w-full overflow-hidden min-w-0">
          <Header />
          <main className="w-full h-full">
            <div className="p-6 space-y-6">
              {/* Header moderno customizado */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl mb-8 shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gerenciamento de Funcionários</h1>
                <p className="text-blue-100 text-lg mt-1">Cadastre e gerencie sua equipe de vendas</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-sm text-blue-100">Total de Funcionários</div>
                <div className="text-2xl font-bold">
                  {employees.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
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
              <Label htmlFor="bank">Banco</Label>
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
              <Label htmlFor="pixMain">Chave PIX Principal</Label>
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
                disabled={loading || !newEmployeeName.trim()}
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
                  <TableCell>{getBankName(employee.bank) || "-"}</TableCell>
                  <TableCell>{employee.pix_key_main || "-"}</TableCell>
                  <TableCell>{employee.pix_key_2 || "-"}</TableCell>
                  <TableCell>{employee.pix_key_3 || "-"}</TableCell>
                  <TableCell>{new Date(employee.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(employee)}
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => confirmDeleteEmployee(employee)}
                        disabled={loading}
                      >
                        Remover
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Delete Dialog */}
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

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Funcionário</DialogTitle>
              <DialogDescription>
                Atualize os dados do funcionário "{employeeToEdit?.name}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div>
                <Label htmlFor="editName">Nome *</Label>
                <Input
                  id="editName"
                  type="text"
                  placeholder="Nome do funcionário"
                  value={editEmployeeName}
                  onChange={(e) => setEditEmployeeName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="editBank">Banco</Label>
                <Input
                  id="editBank"
                  type="text"
                  placeholder="Nome do banco"
                  value={editEmployeeBank}
                  onChange={(e) => setEditEmployeeBank(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="editPixMain">Chave PIX Principal</Label>
                <Input
                  id="editPixMain"
                  type="text"
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  value={editEmployeePixKeyMain}
                  onChange={(e) => setEditEmployeePixKeyMain(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="editPix2">Chave PIX 2 (opcional)</Label>
                <Input
                  id="editPix2"
                  type="text"
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  value={editEmployeePixKey2}
                  onChange={(e) => setEditEmployeePixKey2(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="editPix3">Chave PIX 3 (opcional)</Label>
                <Input
                  id="editPix3"
                  type="text"
                  placeholder="CPF, e-mail, telefone ou chave aleatória"
                  value={editEmployeePixKey3}
                  onChange={(e) => setEditEmployeePixKey3(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button 
                onClick={handleEditEmployee}
                disabled={loading || !editEmployeeName.trim()}
              >
                {loading ? "Atualizando..." : "Salvar alterações"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Employees;


import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Employee {
  id: string;
  name: string;
}

interface Commission {
  id: string;
  lead_id: string;
  amount: number;
  created_at: string;
  status: string;
  lead: {
    name: string;
  };
}

const statusOptions = [
  { value: "all", label: "Todos os Status" },
  { value: "aprovado", label: "Aprovado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "cancelado", label: "Cancelado" },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "aprovado":
      return "bg-green-100 text-green-800";
    case "em_andamento":
      return "bg-amber-100 text-amber-800";
    case "cancelado":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Commission = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Temporary employees data (in a real app, fetch from database)
      setEmployees([
        { id: "all", name: "Todos os Funcionários" },
        { id: "jose", name: "José Silva" },
        { id: "maria", name: "Maria Oliveira" },
        { id: "joao", name: "João Santos" }
      ]);
      
      // Fetch commissions with lead names
      const { data, error } = await supabase
        .from("commissions")
        .select(`
          *,
          lead:leads(name)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      setCommissions(data || []);
      setFilteredCommissions(data || []);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [selectedEmployee, selectedStatus, dateRange, commissions]);

  const applyFilters = () => {
    let filtered = [...commissions];
    
    // Filter by employee
    if (selectedEmployee !== "all") {
      filtered = filtered.filter(commission => commission.id === selectedEmployee);
    }
    
    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(commission => commission.status === selectedStatus);
    }
    
    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(commission => {
        const commissionDate = new Date(commission.created_at);
        return commissionDate >= dateRange.from!;
      });
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(commission => {
        const commissionDate = new Date(commission.created_at);
        // Add one day to the end date to include the entire day
        const endDate = new Date(dateRange.to!);
        endDate.setDate(endDate.getDate() + 1);
        return commissionDate <= endDate;
      });
    }
    
    setFilteredCommissions(filtered);
  };
  
  const resetFilters = () => {
    setSelectedEmployee("all");
    setSelectedStatus("all");
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto p-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Comissões</h1>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-md border mb-6">
            <h2 className="font-medium mb-4">Filtros</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Funcionário</label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um funcionário" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Período</label>
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.from && !dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "P", { locale: ptBR })} -{" "}
                              {format(dateRange.to, "P", { locale: ptBR })}
                            </>
                          ) : (
                            format(dateRange.from, "P", { locale: ptBR })
                          )
                        ) : (
                          "Selecione um período"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="flex items-end">
                <Button variant="outline" onClick={resetFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
          
          {/* Results */}
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-12 animate-pulse rounded-md bg-gray-100" />
              <div className="h-64 animate-pulse rounded-md bg-gray-100" />
            </div>
          ) : filteredCommissions.length > 0 ? (
            <>
              <div className="mb-4">
                <p className="text-sm text-gray-500">
                  Mostrando {filteredCommissions.length} de {commissions.length} comissões
                </p>
              </div>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.map((commission) => (
                      <TableRow key={commission.id}>
                        <TableCell className="font-medium">
                          {commission.lead?.name || "Cliente não encontrado"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(commission.created_at), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(commission.status)}`}>
                            {commission.status === "aprovado" && "Aprovado"}
                            {commission.status === "em_andamento" && "Em andamento"}
                            {commission.status === "cancelado" && "Cancelado"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(commission.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-10 border rounded-md">
              <h3 className="text-lg font-medium text-gray-900">Nenhuma comissão encontrada</h3>
              <p className="mt-1 text-sm text-gray-500">
                Tente ajustar seus filtros ou adicione novas comissões.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Commission;

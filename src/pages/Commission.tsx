
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon, Plus, Settings, Filter, BarChart } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Commission } from "@/types/models";

interface Employee {
  id: string;
  name: string;
}

const statusOptions = [
  { value: "all", label: "Todos os Status" },
  { value: "aprovado", label: "Aprovado" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "cancelado", label: "Cancelado" },
];

const periodOptions = [
  { value: "all", label: "Todos os Períodos" },
  { value: "weekly", label: "Semanal" },
  { value: "biweekly", label: "Quinzenal" },
  { value: "monthly", label: "Mensal" },
];

const productOptions = [
  { value: "all", label: "Todos os Produtos" },
  { value: "portabilidade", label: "Portabilidade" },
  { value: "refinanciamento", label: "Refinanciamento" },
  { value: "crefaz", label: "Crefaz" },
  { value: "novo", label: "Novo" },
  { value: "clt", label: "CLT" },
  { value: "fgts", label: "FGTS" },
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

const getProductLabel = (productValue: string) => {
  const product = productOptions.find(p => p.value === productValue);
  return product ? product.label : productValue;
};

const getPeriodLabel = (periodValue: string) => {
  const period = periodOptions.find(p => p.value === periodValue);
  return period ? period.label : periodValue;
};

const Commission = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [filteredCommissions, setFilteredCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  
  // Filters
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
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
          lead:leads(name, product)
        `)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const mappedData: Commission[] = data.map(item => ({
          id: item.id,
          lead_id: item.lead_id,
          amount: item.amount,
          status: item.status,
          product: item.product,
          payment_period: item.payment_period,
          user_id: item.user_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          lead: item.lead
        }));
        
        setCommissions(mappedData);
        setFilteredCommissions(mappedData);
      }
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
  }, [selectedEmployee, selectedStatus, selectedProduct, selectedPeriod, dateRange, commissions, activeTab]);

  const applyFilters = () => {
    let filtered = [...commissions];
    
    // Filter by tab first
    if (activeTab === "weekly") {
      filtered = filtered.filter(commission => commission.payment_period === "weekly");
    } else if (activeTab === "biweekly") {
      filtered = filtered.filter(commission => commission.payment_period === "biweekly");
    } else if (activeTab === "monthly") {
      filtered = filtered.filter(commission => commission.payment_period === "monthly");
    }
    
    // Filter by employee
    if (selectedEmployee !== "all") {
      filtered = filtered.filter(commission => commission.id === selectedEmployee);
    }
    
    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(commission => commission.status === selectedStatus);
    }
    
    // Filter by product
    if (selectedProduct !== "all") {
      filtered = filtered.filter(commission => commission.product === selectedProduct);
    }
    
    // Filter by payment period
    if (selectedPeriod !== "all") {
      filtered = filtered.filter(commission => commission.payment_period === selectedPeriod);
    }
    
    // Filter by date range
    if (dateRange.from) {
      filtered = filtered.filter(commission => {
        const commissionDate = new Date(commission.created_at || "");
        return commissionDate >= dateRange.from!;
      });
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(commission => {
        const commissionDate = new Date(commission.created_at || "");
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
    setSelectedProduct("all");
    setSelectedPeriod("all");
    setDateRange({ from: undefined, to: undefined });
  };

  // Calculate summary statistics
  const calculateSummary = (commissions: Commission[]) => {
    const total = commissions.reduce((sum, commission) => sum + commission.amount, 0);
    
    const byProduct = commissions.reduce((acc, commission) => {
      const product = commission.product || "não_especificado";
      if (!acc[product]) acc[product] = 0;
      acc[product] += commission.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const byStatus = commissions.reduce((acc, commission) => {
      const status = commission.status || "não_especificado";
      if (!acc[status]) acc[status] = 0;
      acc[status] += commission.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, byProduct, byStatus };
  };
  
  const summary = calculateSummary(filteredCommissions);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto p-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Comissões</h1>
            <div className="flex space-x-2">
              <Button asChild variant="outline">
                <Link to="/commission/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Comissão
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-grid">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="weekly">Semanal</TabsTrigger>
              <TabsTrigger value="biweekly">Quinzenal</TabsTrigger>
              <TabsTrigger value="monthly">Mensal</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total de Comissões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.total)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(summary.byStatus).map(([status, amount]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm">
                        <Badge className={getStatusColor(status)}>
                          {status === "aprovado" ? "Aprovado" : 
                           status === "em_andamento" ? "Em andamento" : 
                           status === "cancelado" ? "Cancelado" : status}
                        </Badge>
                      </span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Por Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(summary.byProduct).map(([product, amount]) => (
                    <div key={product} className="flex justify-between items-center">
                      <span className="text-sm">{getProductLabel(product)}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <div className="bg-white p-4 rounded-md border mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-5 w-5" />
              <h2 className="font-medium">Filtros</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <label className="text-sm text-gray-500 mb-1 block">Produto</label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productOptions.map(product => (
                      <SelectItem key={product.value} value={product.value}>
                        {product.label}
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
                        selected={{
                          from: dateRange.from,
                          to: dateRange.to
                        }}
                        onSelect={(range) => {
                          if (range) {
                            setDateRange({
                              from: range.from,
                              to: range.to
                            });
                          }
                        }}
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
                      <TableHead>Produto</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Período</TableHead>
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
                          {getProductLabel(commission.product || commission.lead?.product || "não_especificado")}
                        </TableCell>
                        <TableCell>
                          {commission.created_at ? format(new Date(commission.created_at), "dd/MM/yyyy") : "N/A"}
                        </TableCell>
                        <TableCell>
                          {getPeriodLabel(commission.payment_period || "não_especificado")}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(commission.status)}`}>
                            {commission.status === "aprovado" && "Aprovado"}
                            {commission.status === "em_andamento" && "Em andamento"}
                            {commission.status === "cancelado" && "Cancelado"}
                            {!["aprovado", "em_andamento", "cancelado"].includes(commission.status) && commission.status}
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

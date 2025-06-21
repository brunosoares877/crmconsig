import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LeadList from "@/components/LeadList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search, Trash2, Filter, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageLayout from "@/components/PageLayout";
import AddLeadButton from "@/components/leads/AddLeadButton";

const Leads = () => {
  const [searchParams] = useSearchParams();
  const [leadStats, setLeadStats] = useState({
    total: 0,
    new: 0,
    qualified: 0,
    converted: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("");
  const [bankFilter, setBankFilter] = useState<string>("");
  const [employees, setEmployees] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [banks, setBanks] = useState<string[]>([]);

  const statusOptions = [
    { value: "novo", label: "Novo" },
    { value: "qualificado", label: "Qualificado" },
    { value: "negociando", label: "Em Negociação" },
    { value: "convertido", label: "Convertido" },
    { value: "perdido", label: "Perdido" }
  ];

  const headerActions = (
    <div className="flex items-center gap-3">
      <AddLeadButton />
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
        <Input 
          placeholder="Buscar por nome, telefone ou CPF..." 
          className="pl-10 py-2 border-blue-100 bg-blue-50/50 hover:bg-blue-50 focus:border-blue-200 focus:ring-1 focus:ring-blue-200 transition-all rounded-full w-full md:w-[280px]" 
          value={searchQuery} 
          onChange={e => setSearchQuery(e.target.value)} 
        />
      </div>
      <Button asChild variant="outline" className="flex items-center gap-2">
        <Link to="/leads/trash">
          <Trash2 className="h-4 w-4" />
          Lixeira
        </Link>
      </Button>
    </div>
  );

  useEffect(() => {
    const fetchLeadStats = async () => {
      setIsLoading(true);
      try {
        // Optimized single query to get all stats at once
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data: allLeads, error: leadsError } = await supabase
          .from('leads')
          .select('status')
          .eq('user_id', userData.user.id);

        if (leadsError) throw leadsError;

        // Calculate stats from the single query result
        const stats = allLeads.reduce((acc, lead) => {
          acc.total++;
          if (lead.status === 'novo') acc.new++;
          if (lead.status === 'qualificado') acc.qualified++;
          if (lead.status === 'convertido') acc.converted++;
          return acc;
        }, { total: 0, new: 0, qualified: 0, converted: 0 });

        setLeadStats(stats);
      } catch (error) {
        console.error('Error fetching lead statistics:', error);
        toast.error("Erro ao carregar estatísticas de leads");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeadStats();
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const statusFromUrl = searchParams.get('status');
    if (statusFromUrl) {
      setStatusFilter(statusFromUrl);
      const statusLabels = {
        'negociando': 'Em Andamento',
        'qualificado': 'Pendente',
        'convertido': 'Pago',
        'perdido': 'Cancelado'
      };
      toast.success(`Filtro aplicado: ${statusLabels[statusFromUrl as keyof typeof statusLabels] || statusFromUrl}`);
    }
  }, [searchParams]);

  const fetchFilterOptions = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      // Buscar funcionários únicos
      const { data: employeeData, error: employeeError } = await supabase
        .from('leads')
        .select('employee')
        .eq('user_id', userData.user.id)
        .not('employee', 'is', null)
        .neq('employee', '');

      if (!employeeError && employeeData) {
        const uniqueEmployees = [...new Set(employeeData.map(item => item.employee))];
        setEmployees(uniqueEmployees);
      }

      // Buscar produtos únicos
      const { data: productData, error: productError } = await supabase
        .from('leads')
        .select('product')
        .eq('user_id', userData.user.id)
        .not('product', 'is', null)
        .neq('product', '');

      if (!productError && productData) {
        const uniqueProducts = [...new Set(productData.map(item => item.product))];
        setProducts(uniqueProducts);
      }

      // Buscar bancos únicos
      const { data: bankData, error: bankError } = await supabase
        .from('leads')
        .select('bank')
        .eq('user_id', userData.user.id)
        .not('bank', 'is', null)
        .neq('bank', '');

      if (!bankError && bankData) {
        const uniqueBanks = [...new Set(bankData.map(item => item.bank))];
        setBanks(uniqueBanks);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const clearAllFilters = () => {
    setStatusFilter("");
    setEmployeeFilter("");
    setProductFilter("");
    setBankFilter("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (employeeFilter) count++;
    if (productFilter) count++;
    if (bankFilter) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <PageLayout 
      title="Gestão de Leads" 
      subtitle="Gerencie e acompanhe todos os seus leads em um só lugar"
      headerActions={headerActions}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl">{isLoading ? "..." : leadStats.total}</CardTitle>
              <CardDescription>Total de Leads</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-blue-600">{isLoading ? "..." : leadStats.new}</CardTitle>
              <CardDescription>Novos Leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Aguardando primeiro contato
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-amber-600">{isLoading ? "..." : leadStats.qualified}</CardTitle>
              <CardDescription>Leads Qualificados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Prontos para negociação
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-green-600">{isLoading ? "..." : leadStats.converted}</CardTitle>
              <CardDescription>Conversões</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Este mês
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros Funcionais */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Filtros</h3>
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Limpar Todos ({activeFiltersCount})
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Funcionário */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Funcionário</label>
              <Select value={employeeFilter || "all"} onValueChange={(value) => setEmployeeFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os funcionários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os funcionários</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Produto */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Produto</label>
              <Select value={productFilter || "all"} onValueChange={(value) => setProductFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Banco */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Banco</label>
              <Select value={bankFilter || "all"} onValueChange={(value) => setBankFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os bancos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os bancos</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filtros Ativos */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              {statusFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusOptions.find(s => s.value === statusFilter)?.label}
                  <button onClick={() => setStatusFilter("")} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {employeeFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Funcionário: {employeeFilter}
                  <button onClick={() => setEmployeeFilter("")} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {productFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Produto: {productFilter}
                  <button onClick={() => setProductFilter("")} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {bankFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Banco: {bankFilter}
                  <button onClick={() => setBankFilter("")} className="ml-1 hover:bg-gray-300 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </Card>

        <LeadList 
          searchQuery={searchQuery} 
          statusFilter={statusFilter}
          employeeFilter={employeeFilter}
          productFilter={productFilter}
          bankFilter={bankFilter}
        />
      </div>
    </PageLayout>
  );
};

export default Leads;

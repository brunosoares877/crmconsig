import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { CalendarIcon, Search, Trash2, Settings, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Lead,
  type Commission as CommissionType
} from "@/types/models";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PageLayout from "@/components/PageLayout";
import { getEmployees, Employee } from "@/utils/employees";
import { mapProductToCommissionConfig } from "@/utils/productMapping";

const Commission = () => {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Partial<Lead>[]>([]);
  const [commissions, setCommissions] = useState<CommissionType[]>([]);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [productFilter, setProductFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [employees, setEmployees] = useState<string[]>([]);
  const [totalCommissionsPending, setTotalCommissionsPending] = useState(0);
  const [totalCommissionsApproved, setTotalCommissionsApproved] = useState(0);
  const [totalCommissionsPaid, setTotalCommissionsPaid] = useState(0);
  const [deletingCommission, setDeletingCommission] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { isPrivilegedUser } = useAuth();

  // Lista de produtos únicos para filtro
  const [products, setProducts] = useState<string[]>([]);

  useEffect(() => {
    fetchCommissions();
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (isPrivilegedUser) {
      toast.success("Bem-vindo! Você tem acesso completo e vitalício ao sistema.", {
        duration: 5000,
      });
    }
  }, [isPrivilegedUser]);

  const fetchEmployees = async () => {
    try {
      const employeeList = await getEmployees();
      setEmployees(employeeList.map(employee => employee.name));
    } catch (error: any) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }
      
      let query = supabase
        .from("commissions")
        .select(`
          *,
          lead:lead_id (
            id, name, product, amount, status, employee, date, created_at
          )
        `)
        .eq("user_id", userData.user.id);

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (productFilter && productFilter !== "all") {
        query = query.eq("product", productFilter);
      }

      query = query.order("created_at", { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (data) {
        let processedCommissions = data.map(item => {
          const commission = item as any;
          
          const amount = typeof commission.amount === 'number' ? commission.amount : 0;
          
          let commissionValue = 0;
          let percentageValue = 0;
          
          // Se existir commission_value na base, usar ele
          if (commission.commission_value !== undefined && commission.commission_value !== null) {
            commissionValue = Number(commission.commission_value) || 0;
          } else {
            // Calcular comissão padrão (5% se não tiver configuração específica)
            commissionValue = amount * 0.05; // 5% padrão
          }
          
          // Se existir percentage na base, usar ele
          if (commission.percentage !== undefined && commission.percentage !== null) {
            percentageValue = Number(commission.percentage) || 0;
          } else {
            percentageValue = 5; // 5% padrão
          }
          
          let leadData = commission.lead;
          if (leadData && typeof leadData.status === 'string') {
            leadData = {
              ...leadData,
              status: leadData.status as any
            };
          }
          
          return {
            ...commission,
            commission_value: commissionValue,
            percentage: percentageValue,
            lead: leadData,
            employee: commission.employee || leadData?.employee || 'Não informado'
          } as CommissionType;
        });

        // Filtrar por data do lead (não da comissão)
        if (dateFrom || dateTo) {
          processedCommissions = processedCommissions.filter(commission => {
            if (!commission.lead) return false;
            
            // Usar a data personalizada do lead, ou created_at como fallback
            const leadDateStr = commission.lead.date || commission.lead.created_at;
            if (!leadDateStr) return false;
            
            // Converter para data local sem problemas de timezone
            let leadDate;
            if (commission.lead.date) {
              // Se é uma data personalizada (formato YYYY-MM-DD), fazer parse manual
              const [year, month, day] = commission.lead.date.split('-');
              leadDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } else {
              // Se é created_at, usar Date normal
              leadDate = new Date(leadDateStr);
            }
            
            if (dateFrom && leadDate < dateFrom) {
              return false;
            }
            
            if (dateTo) {
              const endDate = new Date(dateTo);
              endDate.setHours(23, 59, 59, 999);
              if (leadDate > endDate) {
                return false;
              }
            }
            
            return true;
          });
        }
        
        setCommissions(processedCommissions);
        
        // Extrair produtos únicos para filtro
        const uniqueProducts = [...new Set(processedCommissions.map(c => c.product).filter(Boolean))];
        setProducts(uniqueProducts);
        
        const inProgressTotal = processedCommissions
          .filter(c => c.status === "in_progress")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);

        const pendingTotal = processedCommissions
          .filter(c => c.status === "pending")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
          
        const completedTotal = processedCommissions
          .filter(c => c.status === "completed" || c.status === "approved" || c.status === "paid")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
          
        const cancelledTotal = processedCommissions
          .filter(c => c.status === "cancelled")
          .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
        setTotalCommissionsPending(pendingTotal);
        setTotalCommissionsApproved(completedTotal);
        setTotalCommissionsPaid(inProgressTotal);
      }
    } catch (error: any) {
      console.error("Error fetching commissions:", error);
      toast.error(`Erro ao carregar comissões: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para calcular valor da comissão com base nas configurações
  const calculateCommissionValue = async (leadProduct: string, amount: number): Promise<number> => {
    try {
      // Mapear produto do lead para produto da configuração
      const mappedProduct = mapProductToCommissionConfig(leadProduct);
      
      console.log(`Calculando comissão: ${leadProduct} → ${mappedProduct}, valor: R$ ${amount}`);

      // Buscar taxa fixa primeiro
      const { data: rates } = await supabase
        .from('commission_rates')
        .select('*')
        .eq('product', mappedProduct)
        .eq('active', true);

      if (rates && rates.length > 0) {
        const rate = rates[0] as any;
        console.log(`Taxa fixa encontrada:`, rate);
        
        if (rate.commission_type === 'fixed') {
          const commission = rate.fixed_value || 0;
          console.log(`Comissão fixa: R$ ${commission}`);
          return commission;
        } else {
          const commission = (amount * rate.percentage) / 100;
          console.log(`Comissão percentual: ${rate.percentage}% = R$ ${commission}`);
          return commission;
        }
      }

      // Se não encontrou taxa fixa, buscar por faixas de valor
      const { data: tiers } = await supabase
        .from('commission_tiers')
        .select('*')
        .eq('product', mappedProduct)
        .eq('active', true)
        .lte('min_amount', amount)
        .order('min_amount', { ascending: false });

      if (tiers && tiers.length > 0) {
        for (const tier of tiers) {
          const tierData = tier as any;
          if (tierData.max_amount === null || amount <= tierData.max_amount) {
            console.log(`Faixa encontrada:`, tierData);
            
            if (tierData.commission_type === 'fixed') {
              const commission = tierData.fixed_value || 0;
              console.log(`Comissão fixa por faixa: R$ ${commission}`);
              return commission;
            } else {
              const commission = (amount * tierData.percentage) / 100;
              console.log(`Comissão percentual por faixa: ${tierData.percentage}% = R$ ${commission}`);
              return commission;
            }
          }
        }
      }

      // Taxa padrão de 5% se não encontrar configuração
      const defaultCommission = (amount * 5) / 100;
      console.log(`Taxa padrão aplicada: 5% = R$ ${defaultCommission}`);
      return defaultCommission;
    } catch (error) {
      console.error("Error calculating commission:", error);
      const defaultCommission = (amount * 5) / 100;
      console.log(`Erro - usando taxa padrão: 5% = R$ ${defaultCommission}`);
      return defaultCommission;
    }
  };



  // Função para sincronizar comissões com valores atualizados dos leads
  const syncCommissionsWithLeads = async () => {
    try {
      setIsGenerating(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar todas as comissões com seus leads
      const { data: commissionsWithLeads, error: fetchError } = await supabase
        .from('commissions')
        .select(`
          *,
          lead:lead_id (
            id, amount, product, name
          )
        `)
        .eq('user_id', userData.user.id);

      if (fetchError) {
        console.error('Erro ao buscar comissões para sincronizar:', fetchError);
        toast.error('Erro ao buscar comissões para sincronizar');
        return;
      }

      if (!commissionsWithLeads || commissionsWithLeads.length === 0) {
        toast.info('Não há comissões para sincronizar');
        return;
      }

      console.log(`Sincronizando ${commissionsWithLeads.length} comissões com leads`);

      let updated = 0;
      let skipped = 0;

      for (const commission of commissionsWithLeads) {
        try {
          const lead = commission.lead;
          if (!lead) {
            console.log(`Comissão ${commission.id} não tem lead associado`);
            skipped++;
            continue;
          }

          // Converter valor do lead para número
          const leadAmountStr = lead.amount?.toString() || '0';
          const cleanLeadAmount = leadAmountStr.replace(/[^\d,]/g, '').replace(',', '.');
          const leadAmount = parseFloat(cleanLeadAmount) || 0;

          // Converter valor da comissão para número
          const commissionAmount = parseFloat(commission.amount?.toString() || '0');

          // Verificar se produto ou valor mudaram
          const productChanged = commission.product !== lead.product;
          const amountChanged = Math.abs(commissionAmount - leadAmount) > 0.01; // Tolerância de 1 centavo

          if (!productChanged && !amountChanged) {
            console.log(`Comissão ${commission.id} já está sincronizada`);
            skipped++;
            continue;
          }

          console.log(`Sincronizando comissão ${commission.id}:`);
          console.log(`  Lead: ${lead.name}`);
          console.log(`  Produto: ${commission.product} → ${lead.product}`);
          console.log(`  Valor: R$ ${commissionAmount} → R$ ${leadAmount}`);

          // Calcular nova comissão
          const newCommissionValue = await calculateCommissionValue(lead.product, leadAmount);
          const newPercentage = leadAmount > 0 ? (newCommissionValue / leadAmount) * 100 : 0;

          // Atualizar comissão
          const { error: updateError } = await supabase
            .from('commissions')
            .update({
              amount: leadAmount,
              product: lead.product,
              commission_value: newCommissionValue.toFixed(2),
              percentage: newPercentage.toFixed(2)
            } as any)
            .eq('id', commission.id);

          if (updateError) {
            console.error(`Erro ao atualizar comissão ${commission.id}:`, updateError);
            continue;
          }

          updated++;
          console.log(`  ✅ Atualizada: R$ ${newCommissionValue.toFixed(2)} (${newPercentage.toFixed(2)}%)`);
        } catch (error) {
          console.error(`Erro ao processar comissão ${commission.id}:`, error);
        }
      }

      await fetchCommissions();
      
      const message = `Sincronização concluída! ${updated} comissões atualizadas, ${skipped} já estavam sincronizadas.`;
      toast.success(message);
      
    } catch (error) {
      console.error('Erro ao sincronizar comissões:', error);
      toast.error('Erro ao sincronizar comissões com leads');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCommission = async (commissionId: string) => {
    try {
      setDeletingCommission(commissionId);
      
      const { error } = await supabase
        .from("commissions")
        .delete()
        .eq("id", commissionId);

      if (error) throw error;

      toast.success("Comissão removida com sucesso!");
      fetchCommissions(); // Recarregar dados
    } catch (error: any) {
      console.error("Error deleting commission:", error);
      toast.error(`Erro ao remover comissão: ${error.message}`);
    } finally {
      setDeletingCommission(null);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchClick = () => {
    fetchCommissions();
  };

  const clearFilters = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setEmployeeFilter("");
    setStatusFilter("");
    setProductFilter("");
    setSearch("");
    // Recarregar dados após limpar filtros
    setTimeout(() => fetchCommissions(), 100);
  };

  const filteredCommissions = commissions.filter((commission) => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      commission.lead?.name?.toLowerCase().includes(searchTerm) ||
      commission.product?.toLowerCase().includes(searchTerm) ||
      commission.status?.toLowerCase().includes(searchTerm) ||
      commission.payment_period?.toLowerCase().includes(searchTerm) ||
      commission.employee?.toLowerCase().includes(searchTerm) ||
      commission.lead?.employee?.toLowerCase().includes(searchTerm) ||
      String(commission.amount).toLowerCase().includes(searchTerm) ||
      String(commission.commission_value).toLowerCase().includes(searchTerm);
    
    // Filtro por funcionário/responsável
    const matchesEmployee = employeeFilter === "" || employeeFilter === "all" || 
      (commission.employee && commission.employee === employeeFilter) || 
      (commission.lead?.employee && commission.lead.employee === employeeFilter);
    
    return matchesSearch && matchesEmployee;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Em Andamento</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pendente</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelado</Badge>;
      // Manter compatibilidade com status antigos
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Aprovado</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">Pago</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateEmployeeTotals = () => {
    if (employeeFilter && employeeFilter !== "all") {
      const filteredByEmployee = commissions.filter(
        commission => commission.employee === employeeFilter || commission.lead?.employee === employeeFilter
      );
      
      const inProgress = filteredByEmployee
        .filter(c => c.status === "in_progress")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);

      const pending = filteredByEmployee
        .filter(c => c.status === "pending")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
      const completed = filteredByEmployee
        .filter(c => c.status === "completed" || c.status === "approved" || c.status === "paid")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
        
      const cancelled = filteredByEmployee
        .filter(c => c.status === "cancelled")
        .reduce((acc, curr) => acc + (Number(curr.commission_value) || 0), 0);
      
      return { inProgress, pending, completed, cancelled };
    }
    
    return { 
      inProgress: totalCommissionsPaid,
      pending: totalCommissionsPending,
      completed: totalCommissionsApproved,
      cancelled: 0
    };
  };

  const employeeTotals = calculateEmployeeTotals();

  const generateCommissionsForLeads = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Buscar todos os leads do usuário
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userData.user.id)
        .in("status", ["sold", "convertido"]); // Leads vendidos/convertidos

      if (leadsError) {
        throw leadsError;
      }

      if (!leadsData || leadsData.length === 0) {
        toast.info("Nenhum lead vendido encontrado para gerar comissões.");
        return;
      }

      // Buscar comissões existentes
      const { data: existingCommissions, error: commissionsError } = await supabase
        .from("commissions")
        .select("lead_id")
        .eq("user_id", userData.user.id);

      if (commissionsError) {
        throw commissionsError;
      }

      const existingLeadIds = new Set(existingCommissions?.map(c => c.lead_id) || []);

      // Filtrar leads que não possuem comissões
      const leadsWithoutCommissions = leadsData.filter(lead => !existingLeadIds.has(lead.id));

      if (leadsWithoutCommissions.length === 0) {
        toast.info("Todos os leads vendidos já possuem comissões.");
        return;
      }

      // Buscar taxas de comissão padrão
      const { data: commissionRates, error: ratesError } = await supabase
        .from("commission_rates")
        .select("*")
        .eq("active", true);

      if (ratesError) {
        throw ratesError;
      }

      // Criar comissões para os leads
      const commissionsToCreate = [];

      for (const lead of leadsWithoutCommissions) {
        // Converter valor corretamente removendo caracteres não numéricos
        const cleanAmount = String(lead.amount).replace(/[^\d,]/g, '').replace(',', '.');
        const leadAmount = parseFloat(cleanAmount) || 0;
        
        let commissionValue = 0;
        let percentage = 5; // Default 5%

        // Buscar configuração de comissão específica para o produto
        const calculatedValue = await calculateCommissionValue(lead.product, leadAmount);
        commissionValue = calculatedValue;

        commissionsToCreate.push({
          user_id: userData.user.id,
          lead_id: lead.id,
          amount: leadAmount,
          commission_value: commissionValue,
          percentage: percentage,
          product: lead.product,
          status: 'in_progress',
          payment_period: 'monthly',
          employee: lead.employee || 'Não informado'
        });
      }

      if (commissionsToCreate.length > 0) {
        const { data: createdCommissions, error: createError } = await supabase
          .from("commissions")
          .insert(commissionsToCreate);

        if (createError) {
          throw createError;
        }

        toast.success(`${commissionsToCreate.length} comissões geradas com sucesso!`);
        
        // Recarregar dados
        fetchCommissions();
      }

    } catch (error: any) {
      console.error("Error generating commissions:", error);
      toast.error(`Erro ao gerar comissões: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };



  const renderCommissionTable = () => {
    if (loading) {
      return <div className="text-center py-8">Carregando comissões...</div>;
    }

    if (commissions.length === 0) {
      return <div className="text-center py-8">Nenhuma comissão encontrada.</div>;
    }

    return (
      <Table>
        <TableCaption>Suas comissões e informações detalhadas.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Data do Lead</TableHead>
            <TableHead>Produto</TableHead>
            <TableHead>Valor da Venda</TableHead>
            <TableHead>% Comissão</TableHead>
            <TableHead>Valor Comissão</TableHead>
            <TableHead>Período</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Funcionário</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCommissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                Nenhuma comissão encontrada com os filtros aplicados.
              </TableCell>
            </TableRow>
          ) : (
            filteredCommissions.map((commission) => {
              // Formatear a data do lead
              const leadDateStr = commission.lead?.date || commission.lead?.created_at;
              const leadDateFormatted = leadDateStr ? 
                new Date(leadDateStr).toLocaleDateString('pt-BR') : '-';
              
              return (
                <TableRow key={commission.id}>
                  <TableCell>{commission.lead?.name || 'Sem lead'}</TableCell>
                  <TableCell>{leadDateFormatted}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {commission.product}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      R$ {commission.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-blue-600 font-medium">
                      {commission.percentage?.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-green-600">
                      R$ {commission.commission_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {commission.payment_period === 'monthly' ? 'Mensal' : commission.payment_period}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(commission.status!)}</TableCell>
                  <TableCell>{commission.employee || commission.lead?.employee || "-"}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          disabled={deletingCommission === commission.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover esta comissão? Esta ação não pode ser desfeita.
                            <br />
                            <strong>Produto:</strong> {commission.product}
                            <br />
                            <strong>Valor:</strong> R$ {commission.commission_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteCommission(commission.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Sim, Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={10}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-600">Em Andamento:</span>
                  <br />
                  <span className="font-bold">R$ {employeeTotals.inProgress.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="font-medium text-yellow-600">Pendente:</span>
                  <br />
                  <span className="font-bold">R$ {employeeTotals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="font-medium text-green-600">Concluído:</span>
                  <br />
                  <span className="font-bold">R$ {employeeTotals.completed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="font-medium text-red-600">Cancelado:</span>
                  <br />
                  <span className="font-bold">R$ {employeeTotals.cancelled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  };

  return (
    <PageLayout
      title="💰 Comissões"
      subtitle="Acompanhe e gerencie as comissões do time"
    >
      <div className="space-y-8">
        <div className="mb-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-500" />
              <Input
                type="text"
                placeholder="Buscar comissões..."
                value={search}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <div>
              <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Funcionário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {employees.map(employee => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button onClick={handleSearchClick} variant="default" className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Buscar
              </Button>
            </div>
            <div>
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Limpar
              </Button>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={generateCommissionsForLeads} 
              variant="default" 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? "Gerando..." : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Gerar Comissões dos Leads
                </>
              )}
            </Button>
            


            <Button 
              onClick={syncCommissionsWithLeads} 
              variant="outline" 
              disabled={isGenerating}
              className="bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {isGenerating ? "Sincronizando..." : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar com Leads
                </>
              )}
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/commission/settings'} 
              variant="outline"
              className="bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Taxas
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Inicial do Lead
                <span className="text-xs text-gray-500 block">Filtra pela data do lead, não da comissão</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    size="sm"
                    className="p-4"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Data Final do Lead
                <span className="text-xs text-gray-500 block">Filtra pela data do lead, não da comissão</span>
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "dd/MM/yyyy", { locale: ptBR }) : "Selecionar data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CustomCalendar
                    selected={dateTo}
                    onSelect={setDateTo}
                    currentMonth={currentMonth}
                    onMonthChange={setCurrentMonth}
                    size="sm"
                    className="p-4"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {renderCommissionTable()}
      </div>
    </PageLayout>
  );
};

export default Commission;

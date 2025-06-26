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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomCalendar } from "@/components/ui/custom-calendar";
import { CalendarIcon, Search, Trash2, Settings, FileText, Download, Send, CheckCircle, User } from "lucide-react";
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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Checkbox } from "@/components/ui/checkbox";

// Declarar tipo para autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

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

  const { isPrivilegedUser } = useAuth();

  // Lista de produtos únicos para filtro
  const [products, setProducts] = useState<string[]>([]);

  // Estados para relatório de pagamento
  const [showPaymentReport, setShowPaymentReport] = useState(false);
  const [reportEmployee, setReportEmployee] = useState<string>("all");
  const [reportDateFrom, setReportDateFrom] = useState<string>("");
  const [reportDateTo, setReportDateTo] = useState<string>("");
  const [paymentReport, setPaymentReport] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Estados para personalização do PDF
  const [showPdfCustomization, setShowPdfCustomization] = useState(false);
  const [pdfReportData, setPdfReportData] = useState<any>(null);
  const [pdfColumns, setPdfColumns] = useState({
    numero: true,
    cliente: true,
    data: true,
    produto: true,
    valorVenda: true,
    percentagem: true,
    valorComissao: true,
    status: true,
    cpf: false,
    telefone: false,
    banco: false,
    observacoes: false
  });

  // Estados para configuração do WhatsApp
  const [showWhatsAppConfig, setShowWhatsAppConfig] = useState(false);
  const [currentReportForWhatsApp, setCurrentReportForWhatsApp] = useState<any>(null);
  const [whatsAppConfig, setWhatsAppConfig] = useState({
    includeCommissionValues: true,
    includePercentages: true,
    includeIndividualCommissions: true,
    includeTotal: true
  });

  useEffect(() => {
    fetchCommissions();
    fetchEmployees();
  }, []);

  useEffect(() => {
    // Removido toast de boas-vindas que pode estar interferindo
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
        console.log("🔍 DEBUG: Dados brutos das comissões do banco:", data);
        
        let processedCommissions = data.map((item, index) => {
          const commission = item as any;
          
          console.log(`🔍 DEBUG Comissão ${index + 1}:`, {
            id: commission.id,
            employee_commission: commission.employee,
            lead_data: commission.lead,
            lead_employee: commission.lead?.employee,
            final_employee: commission.employee || commission.lead?.employee || 'Não informado'
          });
          
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
  const calculateCommissionValue = async (leadProduct: string, amount: number, paymentPeriod?: number): Promise<number> => {
    try {
      // Mapear produto do lead para produto da configuração
      const mappedProduct = mapProductToCommissionConfig(leadProduct);
      
      console.log(`Calculando comissão: ${leadProduct} → ${mappedProduct}, valor: R$ ${amount}, prazo: ${paymentPeriod}x`);

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

      // Se não encontrou taxa fixa, buscar por faixas de valor ou período
      const { data: tiers } = await supabase
        .from('commission_tiers')
        .select('*')
        .eq('product', mappedProduct)
        .eq('active', true);

      if (tiers && tiers.length > 0) {
        // Buscar primeiro por faixas de período se o prazo estiver disponível
        if (paymentPeriod && paymentPeriod > 0) {
          const periodTiers = tiers.filter((tier: any) => tier.tier_type === 'period');
          
          for (const tier of periodTiers) {
            const tierData = tier as any;
            if (tierData.min_period <= paymentPeriod && 
                (tierData.max_period === null || paymentPeriod <= tierData.max_period)) {
              console.log(`Faixa de período encontrada:`, tierData);
              
              if (tierData.commission_type === 'fixed') {
                const commission = tierData.fixed_value || 0;
                console.log(`Comissão fixa por prazo: R$ ${commission}`);
                return commission;
              } else {
                const commission = (amount * tierData.percentage) / 100;
                console.log(`Comissão percentual por prazo: ${tierData.percentage}% = R$ ${commission}`);
                return commission;
              }
            }
          }
        }

        // Se não encontrou por período, buscar por faixas de valor
        const valueTiers = tiers.filter((tier: any) => 
          !tier.tier_type || tier.tier_type === 'value'
        );

        for (const tier of valueTiers) {
          const tierData = tier as any;
          if (tierData.min_amount <= amount && 
              (tierData.max_amount === null || amount <= tierData.max_amount)) {
            console.log(`Faixa de valor encontrada:`, tierData);
            
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

      // Taxas padrão específicas por produto quando não há configuração
      let defaultPercentage = 5; // Taxa padrão geral
      
      if (mappedProduct === 'CREDITO FGTS' || leadProduct.includes('SAQUE') || leadProduct.includes('FGTS')) {
        defaultPercentage = 15; // 15% para FGTS
        console.log(`Taxa padrão para FGTS aplicada: ${defaultPercentage}%`);
      } else if (mappedProduct === 'CREDITO CLT' || leadProduct.includes('EMPRESTIMO') || leadProduct.includes('CLT')) {
        defaultPercentage = 2; // 2% para CLT
        console.log(`Taxa padrão para CLT aplicada: ${defaultPercentage}%`);
      } else if (mappedProduct === 'CREDITO PIX/CARTAO' || leadProduct.includes('CARTAO') || leadProduct.includes('PIX')) {
        defaultPercentage = 1.5; // 1.5% para PIX/CARTAO
        console.log(`Taxa padrão para PIX/CARTAO aplicada: ${defaultPercentage}%`);
      } else if (mappedProduct === 'CREDITO INSS' || leadProduct.includes('INSS') || leadProduct.includes('NOVO')) {
        defaultPercentage = 3; // 3% para INSS
        console.log(`Taxa padrão para INSS aplicada: ${defaultPercentage}%`);
      }

      const defaultCommission = (amount * defaultPercentage) / 100;
      console.log(`Taxa padrão aplicada: ${defaultPercentage}% = R$ ${defaultCommission}`);
      return defaultCommission;
    } catch (error) {
      console.error("Error calculating commission:", error);
      const defaultCommission = (amount * 5) / 100;
      console.log(`Erro - usando taxa padrão: 5% = R$ ${defaultCommission}`);
      return defaultCommission;
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
      // Removido o toast de erro que estava aparecendo desnecessariamente
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

  // Função para gerar relatório de pagamento
  const generatePaymentReport = async () => {
    if (!reportDateFrom || !reportDateTo) {
      toast.error("Selecione o período para o relatório");
      return;
    }

    setGeneratingReport(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("Usuário não autenticado");
        return;
      }

      console.log(`🔍 Gerando relatório de pagamento`);
      console.log(`📅 Período: ${reportDateFrom} até ${reportDateTo}`);
      console.log(`👤 Funcionário: ${reportEmployee}`);

      // Buscar todas as comissões do usuário
      const { data: allCommissionsData, error } = await supabase
        .from('commissions')
        .select(`
          *,
          lead:lead_id (*)
        `)
        .eq('user_id', userData.user.id);

      if (error) throw error;

      console.log(`📊 Total de comissões encontradas: ${allCommissionsData?.length || 0}`);
      
      // Debug: verificar dados da primeira comissão
      if (allCommissionsData && allCommissionsData.length > 0) {
        console.log('🔍 DEBUG: Primeira comissão completa:', allCommissionsData[0]);
        console.log('🔍 DEBUG: Lead da primeira comissão:', allCommissionsData[0].lead);
        
        if (allCommissionsData[0].lead) {
          console.log('🔍 DEBUG: Campos disponíveis no lead:');
          Object.keys(allCommissionsData[0].lead).forEach(key => {
            console.log(`   ${key}: ${allCommissionsData[0].lead[key]}`);
          });
        }
      }

      // Filtrar por funcionário usando a função melhorada
      let commissionsByEmployee = filterCommissionsByEmployee(allCommissionsData || [], reportEmployee);

      // Filtrar por data do lead
      let commissionsData = commissionsByEmployee.filter(commission => {
        if (!commission.lead) return false;
        
        // Usar a data personalizada do lead, ou created_at como fallback
        const leadDateStr = (commission.lead as any).date || commission.lead.created_at;
        if (!leadDateStr) return false;
        
        // Converter para data local
        let leadDate;
        if ((commission.lead as any).date) {
          const [year, month, day] = (commission.lead as any).date.split('-');
          leadDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        } else {
          leadDate = new Date(leadDateStr);
        }
        
        const startDate = new Date(reportDateFrom);
        const endDate = new Date(reportDateTo);
        endDate.setHours(23, 59, 59, 999);
        
        const isInRange = leadDate >= startDate && leadDate <= endDate;
        
        if (isInRange) {
          console.log(`📅 Incluindo: ${commission.lead.name} (${leadDate.toLocaleDateString('pt-BR')})`);
        }
        
        return isInRange;
      });

      console.log(`🎯 Comissões após todos os filtros: ${commissionsData.length}`);

      if (commissionsData.length === 0) {
        console.log(`⚠️ Nenhuma comissão encontrada para os filtros aplicados`);
        toast.info('Nenhuma comissão encontrada para o período e funcionário selecionados');
        setPaymentReport(null);
        return;
      }

      if (reportEmployee && reportEmployee !== "all") {
        // Relatório individual
        const employeeCommissions = commissionsData;
        const totalAmount = employeeCommissions.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0);
        const totalCommissionValue = employeeCommissions.reduce((sum: number, c: any) => sum + (parseFloat(c.commission_value) || 0), 0);

        console.log(`📋 Relatório individual para ${reportEmployee}:`);
        console.log(`   - Total de vendas: ${employeeCommissions.length}`);
        console.log(`   - Valor total: R$ ${totalAmount.toFixed(2)}`);
        console.log(`   - Comissões: R$ ${totalCommissionValue.toFixed(2)}`);

        setPaymentReport({
          employee: reportEmployee,
          commissions: employeeCommissions,
          totalAmount,
          totalCommissionValue,
          totalLeads: employeeCommissions.length
        });
      } else {
        // Relatório de todos os funcionários
        const employeeGroups = commissionsData.reduce((groups: any, commission: any) => {
          const emp = commission.employee || commission.lead?.employee || 'Não informado';
          if (!groups[emp]) {
            groups[emp] = [];
          }
          groups[emp].push(commission);
          return groups;
        }, {});

        const reports = Object.entries(employeeGroups).map(([emp, comms]: [string, any]) => ({
          employee: emp,
          commissions: comms,
          totalAmount: comms.reduce((sum: number, c: any) => sum + (parseFloat(c.amount) || 0), 0),
          totalCommissionValue: comms.reduce((sum: number, c: any) => sum + (parseFloat(c.commission_value) || 0), 0),
          totalLeads: comms.length
        }));

        console.log(`📋 Relatório de todos os funcionários:`);
        reports.forEach(report => {
          console.log(`   - ${report.employee}: ${report.totalLeads} vendas, R$ ${report.totalCommissionValue.toFixed(2)}`);
        });

        setPaymentReport(reports);
      }

      const totalFound = commissionsData.length;
      toast.success(`Relatório gerado! ${totalFound} ${totalFound === 1 ? 'comissão encontrada' : 'comissões encontradas'}.`);
    } catch (error: any) {
      console.error('Error generating payment report:', error);
      toast.error(`Erro ao gerar relatório: ${error.message}`);
    } finally {
      setGeneratingReport(false);
    }
  };

  // Função para alterar status de uma comissão
  const changeCommissionStatus = async (commissionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ 
          status: newStatus,
          ...(newStatus === 'paid' ? { payment_date: new Date().toISOString() } : {})
        })
        .eq('id', commissionId);

      if (error) throw error;

      toast.success(`Status alterado para: ${newStatus}`);
      fetchCommissions(); // Recarregar dados da tabela principal
      
      // Se estiver com relatório aberto, recarregar também
      if (paymentReport) {
        generatePaymentReport();
      }
    } catch (error: any) {
      console.error('Error changing commission status:', error);
      toast.error(`Erro ao alterar status: ${error.message}`);
    }
  };

  // Função para gerar mensagem do WhatsApp
  const generateWhatsAppMessage = (report: any, config = whatsAppConfig): string => {
    const periodText = `${format(new Date(reportDateFrom), 'dd/MM/yyyy')} a ${format(new Date(reportDateTo), 'dd/MM/yyyy')}`;
    
    let message = `*RELATÓRIO DE VENDAS*\n\n`;
    
    // Informações do funcionário
    message += `*Funcionário:* ${report.employee}\n`;
    message += `*Período:* ${periodText}\n\n`;
    
    // Resumo executivo
    message += `*RESUMO EXECUTIVO*\n`;
    message += `Total de Vendas: *${report.totalLeads}*\n`;
    message += `Valor Total Vendido: *R$ ${report.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
    
    if (config.includeTotal) {
      message += `Total de Comissões: *R$ ${report.totalCommissionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n`;
    }
    
    message += `\n`;
    
    // Detalhamento das vendas
    if (config.includeIndividualCommissions) {
      message += `*DETALHAMENTO DAS VENDAS*\n\n`;
      
      report.commissions.forEach((commission: any, index: number) => {
        const leadDate = commission.lead?.date || commission.lead?.created_at;
        const dateFormatted = leadDate ? format(new Date(leadDate), 'dd/MM/yyyy') : 'N/A';
        
        message += `*${index + 1}. ${commission.lead?.name || 'Cliente'}*\n`;
        message += `Data: ${dateFormatted}\n`;
        message += `Produto: ${commission.product}\n`;
        message += `Valor da Venda: R$ ${(commission.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
        
        if (config.includeCommissionValues || config.includePercentages) {
          let commissionLine = 'Comissão: ';
          if (config.includePercentages) {
            commissionLine += `${(commission.percentage || 0).toFixed(1)}%`;
          }
          if (config.includeCommissionValues) {
            if (config.includePercentages) {
              commissionLine += ` = `;
            }
            commissionLine += `*R$ ${(commission.commission_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*`;
          }
          message += `${commissionLine}\n`;
        }
        
        // Status sem emoji
        let statusText = '';
        switch (commission.status) {
          case 'paid':
            statusText = 'PAGO';
            break;
          case 'approved':
            statusText = 'APROVADO';
            break;
          case 'completed':
            statusText = 'CONCLUÍDO';
            break;
          case 'pending':
            statusText = 'PENDENTE';
            break;
          case 'in_progress':
            statusText = 'EM ANDAMENTO';
            break;
          default:
            statusText = 'CANCELADO';
        }
        message += `Status: *${statusText}*\n\n`;
      });
    }
    
    // Status geral
    const allPaid = report.commissions.every((c: any) => c.status === 'paid');
    const someApproved = report.commissions.some((c: any) => c.status === 'approved' || c.status === 'completed');
    
    if (allPaid) {
      message += `*STATUS GERAL: TOTALMENTE PAGO*\n`;
    } else if (someApproved) {
      message += `*STATUS GERAL: PARCIALMENTE PROCESSADO*\n`;
    } else {
      message += `*STATUS GERAL: PENDENTE DE PAGAMENTO*\n`;
    }
    
    message += `\n*LeadConsig CRM*\n`;
    message += `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`;
    
    return message;
  };

  // Função para abrir configuração do WhatsApp
  const openWhatsAppConfig = (report: any) => {
    setCurrentReportForWhatsApp(report);
    setShowWhatsAppConfig(true);
  };

  // Função para enviar relatório via WhatsApp com configurações personalizadas
  const sendWhatsAppReportWithConfig = () => {
    if (!currentReportForWhatsApp) return;
    
    const message = generateWhatsAppMessage(currentReportForWhatsApp, whatsAppConfig);
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(url, '_blank');
    toast.success(`Relatório preparado para envio via WhatsApp!`);
    setShowWhatsAppConfig(false);
    setCurrentReportForWhatsApp(null);
  };

  // Função para enviar relatório via WhatsApp (compatibilidade)
  const sendWhatsAppReport = (report: any) => {
    openWhatsAppConfig(report);
  };

  // Função para marcar comissões como pagas
  const markCommissionsAsPaid = async (employeeName: string, commissionIds: string[]) => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ 
          status: 'paid',
          payment_date: new Date().toISOString()
        })
        .in('id', commissionIds);

      if (error) throw error;

      toast.success(`Comissões de ${employeeName} marcadas como pagas!`);
      fetchCommissions(); // Recarregar dados
      generatePaymentReport(); // Atualizar relatório
    } catch (error: any) {
      console.error('Error marking commissions as paid:', error);
      toast.error(`Erro ao marcar como pago: ${error.message}`);
    }
  };

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
        
        console.log(`🔍 Gerando comissão para: ${lead.name}`);
        console.log(`   Produto: ${lead.product}`);
        console.log(`   Valor: R$ ${leadAmount}`);
        console.log(`   Prazo: ${(lead as any).payment_period || 'Não informado'}`);

        // Buscar configuração de comissão específica para o produto
        const paymentPeriod = (lead as any).payment_period ? parseInt((lead as any).payment_period.toString()) : undefined;
        const calculatedValue = await calculateCommissionValue(lead.product, leadAmount, paymentPeriod);
        
        // Calcular percentual correto baseado no valor calculado
        const calculatedPercentage = leadAmount > 0 ? (calculatedValue / leadAmount) * 100 : 0;
        
        console.log(`   Comissão calculada: R$ ${calculatedValue.toFixed(2)} (${calculatedPercentage.toFixed(2)}%)`);

        commissionsToCreate.push({
          user_id: userData.user.id,
          lead_id: lead.id,
          amount: leadAmount,
          commission_value: calculatedValue,
          percentage: calculatedPercentage, // Agora usa o percentual calculado correto
          product: lead.product,
          status: 'in_progress',
          payment_period: 'monthly',
          employee: lead.employee || 'Não informado'
        });
      }

      console.log(`📊 Total de comissões a criar: ${commissionsToCreate.length}`);
      commissionsToCreate.forEach((commission, i) => {
        console.log(`   ${i + 1}. ${commission.product} - R$ ${commission.commission_value.toFixed(2)} (${commission.percentage.toFixed(2)}%)`);
      });

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
                    <span className="font-semibold text-slate-700">
                      R$ {commission.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">
                      {commission.percentage?.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-bold text-green-700 bg-green-50 px-2 py-1 rounded">
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
                            <strong className="text-slate-700">Produto:</strong> <span className="text-blue-700 font-semibold">{commission.product}</span>
                            <br />
                            <strong className="text-slate-700">Valor:</strong> <span className="text-green-700 font-bold">R$ {commission.commission_value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
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
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <span className="font-medium text-blue-600">Em Andamento:</span>
                  <br />
                  <span className="font-bold text-blue-700 text-lg">R$ {employeeTotals.inProgress.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <span className="font-medium text-yellow-600">Pendente:</span>
                  <br />
                  <span className="font-bold text-yellow-700 text-lg">R$ {employeeTotals.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <span className="font-medium text-green-600">Concluído:</span>
                  <br />
                  <span className="font-bold text-green-700 text-lg">R$ {employeeTotals.completed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <span className="font-medium text-red-600">Cancelado:</span>
                  <br />
                  <span className="font-bold text-red-700 text-lg">R$ {employeeTotals.cancelled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );
  };

  // Função para gerar PDF das comissões
  const generatePDFReport = (report: any) => {
    try {
      console.log('📄 Iniciando geração de PDF...');
      console.log('Dados do relatório:', report);
      console.log('Comissões encontradas:', report.commissions?.length || 0);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Configurar fonte para suportar caracteres especiais
      doc.setFont('helvetica');
      
      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(40, 116, 240); // Azul
      const title = 'RELATORIO DE COMISSOES';
      doc.text(title, pageWidth / 2, 20, { align: 'center' });
      
      // Linha divisória
      doc.setDrawColor(40, 116, 240);
      doc.setLineWidth(1);
      doc.line(20, 25, pageWidth - 20, 25);
      
      // Informações do funcionário
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Funcionario: ${report.employee || 'N/A'}`, 20, 40);
      
      // Verificar se as datas existem
      let periodText = 'Periodo nao informado';
      try {
        if (reportDateFrom && reportDateTo) {
          periodText = `Periodo: ${format(new Date(reportDateFrom), 'dd/MM/yyyy')} a ${format(new Date(reportDateTo), 'dd/MM/yyyy')}`;
        }
      } catch (dateError) {
        console.warn('Erro ao formatar datas:', dateError);
      }
      
      doc.text(periodText, 20, 50);
      
      // Resumo geral
      doc.setFontSize(12);
      doc.setFillColor(240, 248, 255); // Azul claro
      doc.rect(20, 60, pageWidth - 40, 35, 'F');
      doc.setTextColor(0, 0, 0);
      
      const resumoY = 75;
      const totalLeads = report.totalLeads || 0;
      const totalAmount = report.totalAmount || 0;
      const totalCommissionValue = report.totalCommissionValue || 0;
      
      doc.text(`Total de Vendas: ${totalLeads}`, 30, resumoY);
      doc.text(`Valor Total Vendido: R$ ${totalAmount.toFixed(2).replace('.', ',')}`, 30, resumoY + 10);
      doc.text(`Total de Comissoes: R$ ${totalCommissionValue.toFixed(2).replace('.', ',')}`, 30, resumoY + 20);
      
      // Detalhamento das vendas
      let currentY = 110;
      doc.setFontSize(14);
      doc.setTextColor(40, 116, 240);
      doc.text('DETALHAMENTO DAS VENDAS', 20, currentY);
      
      // Verificar se há comissões
      if (!report.commissions || !Array.isArray(report.commissions) || report.commissions.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Nenhuma comissao encontrada para este periodo.', 20, currentY + 20);
      } else {
        console.log('📋 Processando comissões para a tabela...');
        
        // Preparar dados para a tabela com verificação detalhada
        const tableData: string[][] = [];
        
        report.commissions.forEach((commission: any, index: number) => {
          try {
            console.log(`Processando comissão ${index + 1}:`, commission);
            
            // Data do lead
            const leadDate = commission.lead?.date || commission.lead?.created_at;
            let dateFormatted = 'N/A';
            if (leadDate) {
              try {
                dateFormatted = format(new Date(leadDate), 'dd/MM/yyyy');
              } catch (e) {
                dateFormatted = leadDate.toString().substring(0, 10) || 'N/A';
              }
            }
            
            // Dados básicos
            const clientName = commission.lead?.name || `Cliente ${index + 1}`;
            const product = commission.product || 'N/A';
            const amount = parseFloat(commission.amount?.toString() || '0') || 0;
            const percentage = parseFloat(commission.percentage?.toString() || '0') || 0;
            const commissionValue = parseFloat(commission.commission_value?.toString() || '0') || 0;
            
            // Status
            let status = 'Em Andamento';
            switch (commission.status) {
              case 'paid': status = 'Pago'; break;
              case 'approved': status = 'Aprovado'; break;
              case 'completed': status = 'Concluido'; break;
              case 'pending': status = 'Pendente'; break;
              case 'cancelled': status = 'Cancelado'; break;
            }
            
            console.log(`Cliente: ${clientName}, Produto: ${product}, Valor: ${amount}`);
            
            // Adicionar linha à tabela
            tableData.push([
              (index + 1).toString(),
              clientName.substring(0, 20),
              dateFormatted,
              product.substring(0, 15),
              `R$ ${amount.toFixed(2).replace('.', ',')}`,
              `${percentage.toFixed(1)}%`,
              `R$ ${commissionValue.toFixed(2).replace('.', ',')}`,
              status
            ]);
            
          } catch (itemError) {
            console.error(`Erro ao processar comissão ${index + 1}:`, itemError);
            tableData.push([
              (index + 1).toString(),
              'Erro nos dados',
              'N/A',
              'N/A',
              'R$ 0,00',
              '0%',
              'R$ 0,00',
              'Erro'
            ]);
          }
        });

        console.log('📊 Dados da tabela preparados:', tableData);

        // Adicionar tabela usando autoTable
        try {
          console.log('📊 Dados da tabela preparados:', tableData);
          
          doc.autoTable({
            startY: currentY + 10,
            head: [['#', 'Cliente', 'Data', 'Produto', 'Valor Venda', '% Com.', 'Valor Com.', 'Status']],
            body: tableData,
            theme: 'striped',
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            headStyles: {
              fillColor: [40, 116, 240],
              textColor: 255,
              fontStyle: 'bold',
              fontSize: 9,
            },
            columnStyles: {
              0: { halign: 'center', cellWidth: 8 },
              1: { cellWidth: 30 },
              2: { halign: 'center', cellWidth: 18 },
              3: { cellWidth: 25 },
              4: { halign: 'right', cellWidth: 22 },
              5: { halign: 'center', cellWidth: 12 },
              6: { halign: 'right', cellWidth: 22 },
              7: { halign: 'center', cellWidth: 18 }
            },
            margin: { left: 20, right: 20 }
          });
          
          console.log('✅ Tabela criada com sucesso');
          
        } catch (tableError) {
          console.error('❌ Erro ao criar tabela:', tableError);
          
          // Fallback: criar tabela manualmente
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          let y = currentY + 20;
          
          // Cabeçalho manual
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text('#', 25, y);
          doc.text('Cliente', 35, y);
          doc.text('Data', 70, y);
          doc.text('Produto', 90, y);
          doc.text('Valor Venda', 120, y);
          doc.text('%', 150, y);
          doc.text('Comissão', 160, y);
          doc.text('Status', 180, y);
          
          y += 10;
          doc.setFont('helvetica', 'normal');
          
          // Linhas de dados
          tableData.forEach((row, index) => {
            if (y > 250) { // Nova página se necessário
              doc.addPage();
              y = 30;
            }
            
            doc.text(row[0], 25, y);
            doc.text(row[1], 35, y);
            doc.text(row[2], 70, y);
            doc.text(row[3], 90, y);
            doc.text(row[4], 120, y);
            doc.text(row[5], 150, y);
            doc.text(row[6], 160, y);
            doc.text(row[7], 180, y);
            
            y += 8;
          });
          
          console.log('✅ Tabela manual criada como fallback');
        }
      }

      // Rodapé com informações adicionais
      const finalY = Math.max(doc.lastAutoTable?.finalY || currentY + 50, currentY + 100);
      
      // Status geral
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 0); // Verde
      const allPaid = report.commissions?.every((c: any) => c.status === 'paid') || false;
      const statusText = allPaid ? 'STATUS: TOTALMENTE PAGO' : 'STATUS: PENDENTE DE PAGAMENTO';
      doc.text(statusText, pageWidth / 2, finalY + 10, { align: 'center' });
      
      // Assinatura/Sistema
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Gerado pelo LeadConsig CRM', pageWidth / 2, finalY + 25, { align: 'center' });
      
      try {
        const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');
        doc.text(`Data de geracao: ${currentDate}`, pageWidth / 2, finalY + 35, { align: 'center' });
      } catch (dateError) {
        doc.text('Data de geracao: N/A', pageWidth / 2, finalY + 35, { align: 'center' });
      }

      // Salvar o PDF
      const employeeName = (report.employee || 'funcionario').replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
      const fileName = `comissoes_${employeeName}_${timestamp}.pdf`;
      
      console.log('💾 Salvando PDF:', fileName);
      doc.save(fileName);
      
      toast.success(`✅ PDF gerado com sucesso: ${fileName}`);
      
    } catch (error: any) {
      console.error('❌ Erro completo ao gerar PDF:', error);
      console.error('Stack trace:', error.stack);
      toast.error(`Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Função melhorada para filtrar por funcionário
  const filterCommissionsByEmployee = (commissions: any[], employeeName: string) => {
    if (!employeeName || employeeName === "all") return commissions;
    
    console.log(`🔍 Filtrando comissões para: "${employeeName}"`);
    console.log(`📊 Total de comissões antes do filtro: ${commissions.length}`);
    
    const filtered = commissions.filter(commission => {
      // Verificar tanto commission.employee quanto lead.employee
      const commissionEmployee = commission.employee || '';
      const leadEmployee = commission.lead?.employee || '';
      
      // Múltiplas verificações para maior precisão
      const matches = [
        commissionEmployee === employeeName,
        leadEmployee === employeeName,
        commissionEmployee.toLowerCase() === employeeName.toLowerCase(),
        leadEmployee.toLowerCase() === employeeName.toLowerCase(),
        commissionEmployee.includes(employeeName),
        leadEmployee.includes(employeeName),
        employeeName.includes(commissionEmployee) && commissionEmployee.length > 2,
        employeeName.includes(leadEmployee) && leadEmployee.length > 2
      ].some(Boolean);
      
      if (matches) {
        console.log(`✅ Incluindo: ${commission.lead?.name} (emp: "${commissionEmployee}", lead: "${leadEmployee}")`);
      }
      
      return matches;
    });
    
    console.log(`🎯 Comissões após filtro: ${filtered.length}`);
    return filtered;
  };

  // Função para abrir modal de personalização do PDF
  const openPdfCustomization = (report: any) => {
    setPdfReportData(report);
    setShowPdfCustomization(true);
  };

  // Função para gerar PDF personalizado (versão simplificada)
  const generateCustomizedPDFReport = () => {
    try {
      const report = pdfReportData;
      console.log('📄 ======================');
      console.log('📄 GERANDO PDF PERSONALIZADO');
      console.log('📄 ======================');
      console.log('Colunas selecionadas:', pdfColumns);
      console.log('Total de comissões:', report.commissions?.length || 0);

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Configurar fonte para suportar caracteres especiais
      doc.setFont('helvetica');
      
      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(40, 116, 240); // Azul
      const title = 'RELATORIO DE COMISSOES';
      doc.text(title, pageWidth / 2, 20, { align: 'center' });
      
      // Linha divisória
      doc.setDrawColor(40, 116, 240);
      doc.setLineWidth(1);
      doc.line(20, 25, pageWidth - 20, 25);
      
      // Informações do funcionário
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`Funcionario: ${reportEmployee || 'Todos'}`, 20, 40);
      
      // Período
      let periodText = 'Periodo nao informado';
      try {
        if (reportDateFrom && reportDateTo) {
          periodText = `Periodo: ${format(new Date(reportDateFrom), 'dd/MM/yyyy')} a ${format(new Date(reportDateTo), 'dd/MM/yyyy')}`;
        }
      } catch (dateError) {
        console.warn('Erro ao formatar datas:', dateError);
      }
      
      doc.text(periodText, 20, 50);
      
      // Resumo geral
      doc.setFontSize(12);
      doc.setFillColor(240, 248, 255); // Azul claro
      doc.rect(20, 60, pageWidth - 40, 35, 'F');
      doc.setTextColor(0, 0, 0);
      
      const resumoY = 75;
      const totalLeads = report.totalLeads || 0;
      const totalAmount = report.totalAmount || 0;
      const totalCommissionValue = report.totalCommissionValue || 0;
      
      doc.text(`Total de Vendas: ${totalLeads}`, 30, resumoY);
      doc.text(`Valor Total Vendido: R$ ${totalAmount.toFixed(2).replace('.', ',')}`, 30, resumoY + 10);
      doc.text(`Total de Comissoes: R$ ${totalCommissionValue.toFixed(2).replace('.', ',')}`, 30, resumoY + 20);
      
      // Detalhamento das vendas (versão simplificada sem autoTable)
      let currentY = 110;
      doc.setFontSize(14);
      doc.setTextColor(40, 116, 240);
      doc.text('DETALHAMENTO DAS VENDAS', 20, currentY);
      
      // Verificar se há comissões
      if (!report.commissions || !Array.isArray(report.commissions) || report.commissions.length === 0) {
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Nenhuma comissao encontrada para este periodo.', 20, currentY + 20);
      } else {
        console.log('📋 Gerando lista de comissões...');
        
        // Cabeçalho manual simples
        currentY += 20;
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('# | Cliente | Data | Produto | Valor | Comissao | CPF | Telefone', 20, currentY);
        doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
        
        currentY += 10;
        
        // Processar cada comissão
        report.commissions.forEach((commission: any, index: number) => {
          try {
            // Verificar se precisa de nova página
            if (currentY > 250) {
              doc.addPage();
              currentY = 30;
              // Repetir cabeçalho
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
              doc.text('# | Cliente | Data | Produto | Valor | Comissao | CPF | Telefone', 20, currentY);
              doc.line(20, currentY + 2, pageWidth - 20, currentY + 2);
              currentY += 10;
            }
            
            // Dados básicos
            const clientName = commission.lead?.name || `Cliente ${index + 1}`;
            const product = commission.product || 'N/A';
            const amount = parseFloat(commission.amount?.toString() || '0') || 0;
            const commissionValue = parseFloat(commission.commission_value?.toString() || '0') || 0;
            
            // Data do lead
            const leadDate = commission.lead?.date || commission.lead?.created_at;
            let dateFormatted = 'N/A';
            if (leadDate) {
              try {
                dateFormatted = format(new Date(leadDate), 'dd/MM/yyyy');
              } catch (e) {
                dateFormatted = leadDate.toString().substring(0, 10) || 'N/A';
              }
            }
            
            // CPF e telefone
            let cpf = 'N/A';
            let telefone = 'N/A';
            
            if (commission.lead) {
              cpf = commission.lead.cpf || commission.lead.document || commission.lead.doc || 'N/A';
              telefone = commission.lead.phone || commission.lead.telefone || commission.lead.contact || 'N/A';
              
              // Log apenas para primeira comissão
              if (index === 0) {
                console.log('🔍 DEBUG CPF/TELEFONE:');
                console.log('   lead.cpf:', commission.lead.cpf);
                console.log('   lead.phone:', commission.lead.phone);
                console.log('   CPF final:', cpf);
                console.log('   Telefone final:', telefone);
              }
            }
            
            // Montar linha de texto baseada nas colunas selecionadas
            let linha = '';
            
            if (pdfColumns.numero) linha += `${index + 1} | `;
            if (pdfColumns.cliente) linha += `${clientName.substring(0, 15)} | `;
            if (pdfColumns.data) linha += `${dateFormatted} | `;
            if (pdfColumns.produto) linha += `${product.substring(0, 10)} | `;
            if (pdfColumns.valorVenda) linha += `R$ ${amount.toFixed(2)} | `;
            if (pdfColumns.valorComissao) linha += `R$ ${commissionValue.toFixed(2)} | `;
            if (pdfColumns.cpf) {
              linha += `${cpf.substring(0, 12)} | `;
              console.log(`📋 CPF incluído na linha ${index + 1}: '${cpf}'`);
            }
            if (pdfColumns.telefone) {
              linha += `${telefone.substring(0, 12)} | `;
              console.log(`📞 Telefone incluído na linha ${index + 1}: '${telefone}'`);
            }
            
            // Remover último separador
            linha = linha.replace(/ \| $/, '');
            
            doc.setFontSize(8);
            doc.text(linha, 20, currentY);
            currentY += 8;
            
            console.log(`📋 Linha ${index + 1} adicionada: ${linha}`);
            
          } catch (itemError) {
            console.error(`❌ Erro ao processar comissão ${index + 1}:`, itemError);
            doc.text(`Erro na linha ${index + 1}`, 20, currentY);
            currentY += 8;
          }
        });
      }

      // Rodapé
      const finalY = Math.max(currentY + 20, 200);
      
      // Status geral
      doc.setFontSize(12);
      doc.setTextColor(0, 100, 0);
      const allPaid = report.commissions?.every((c: any) => c.status === 'paid') || false;
      const statusText = allPaid ? 'STATUS: TOTALMENTE PAGO' : 'STATUS: PENDENTE DE PAGAMENTO';
      doc.text(statusText, pageWidth / 2, finalY + 10, { align: 'center' });
      
      // Assinatura
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text('Gerado pelo LeadConsig CRM', pageWidth / 2, finalY + 25, { align: 'center' });
      
      try {
        const currentDate = format(new Date(), 'dd/MM/yyyy HH:mm');
        doc.text(`Data de geracao: ${currentDate}`, pageWidth / 2, finalY + 35, { align: 'center' });
      } catch (dateError) {
        doc.text('Data de geracao: N/A', pageWidth / 2, finalY + 35, { align: 'center' });
      }

      // Salvar o PDF
      const employeeName = (reportEmployee || 'funcionario').replace(/[^a-zA-Z0-9]/g, '_');
      const timestamp = format(new Date(), 'yyyyMMdd_HHmm');
      const fileName = `comissoes_${employeeName}_${timestamp}.pdf`;
      
      console.log('💾 Salvando PDF:', fileName);
      doc.save(fileName);
      
      toast.success(`✅ PDF personalizado gerado: ${fileName}`);
      setShowPdfCustomization(false);
      
    } catch (error: any) {
      console.error('❌ ERRO COMPLETO:', error);
      toast.error(`Erro ao gerar PDF: ${error.message || 'Erro desconhecido'}`);
    }
  };





  return (
    <PageLayout
      title=""
      subtitle=""
    >
      {/* Header moderno customizado */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl mb-8 shadow-xl">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gestão de Comissões</h1>
                <p className="text-blue-100 text-lg mt-1">Acompanhe e gerencie as comissões da sua equipe</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                <div className="text-sm text-blue-100">Total de Comissões</div>
                <div className="text-2xl font-bold">
                  R$ {(totalCommissionsPending + totalCommissionsApproved + totalCommissionsPaid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de métricas aprimorados */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border border-blue-100 p-6 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Andamento</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {totalCommissionsPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-yellow-100 p-6 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendente</p>
              <p className="text-2xl font-bold text-yellow-600">
                R$ {totalCommissionsPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-green-100 p-6 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Aprovado</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {totalCommissionsApproved.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6 transform hover:scale-105 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Geral</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {(totalCommissionsPending + totalCommissionsApproved + totalCommissionsPaid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
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
              onClick={() => window.location.href = '/commission/settings'} 
              variant="outline"
              className="px-4 py-2 bg-white border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configurar Taxas
            </Button>

            <Button 
              onClick={() => {
                // Definir data padrão (mês atual)
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                
                setReportDateFrom(format(firstDay, 'yyyy-MM-dd'));
                setReportDateTo(format(lastDay, 'yyyy-MM-dd'));
                setShowPaymentReport(true);
              }}
              className="relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 border-0"
            >
              <div className="flex items-center">
                <div className="bg-white/20 rounded-full p-1 mr-3">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-bold">📊 Relatório de Pagamento</span>
                  <span className="text-xs opacity-90">Gerar relatórios detalhados</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg blur-lg -z-10"></div>
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

      {/* Modal de Relatório de Pagamento */}
      <Dialog open={showPaymentReport} onOpenChange={setShowPaymentReport}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Relatório de Pagamento
            </DialogTitle>
            <DialogDescription>
              Gere relatórios detalhados de comissões para pagamento dos funcionários
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Funcionário</label>
                <Select value={reportEmployee} onValueChange={setReportEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os funcionários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os funcionários</SelectItem>
                    {employees.map(employee => (
                      <SelectItem key={employee} value={employee}>
                        {employee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data Inicial</label>
                <Input
                  type="date"
                  value={reportDateFrom}
                  onChange={(e) => setReportDateFrom(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Data Final</label>
                <Input
                  type="date"
                  value={reportDateTo}
                  onChange={(e) => setReportDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generatePaymentReport}
                disabled={generatingReport}
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-4 w-4 mr-2" />
                {generatingReport ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Gerando...
                  </>
                ) : (
                  "📊 Gerar Relatório"
                )}
              </Button>
            </div>

            {/* Relatório */}
            {paymentReport && (
              <div className="space-y-4">
                {Array.isArray(paymentReport) ? (
                  // Múltiplos funcionários
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Relatório de Todos os Funcionários</h3>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-700">
                          R$ {paymentReport.reduce((sum: number, emp: any) => sum + emp.totalCommissionValue, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-sm text-blue-600">Total Geral de Comissões</div>
                      </div>
                    </div>
                    {paymentReport.map((report: any) => renderSingleEmployeeReport(report))}
                  </div>
                ) : (
                  // Funcionário individual
                  <div>
                    <h3 className="text-lg font-semibold">Relatório Individual</h3>
                    {renderSingleEmployeeReport(paymentReport)}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Personalização do PDF */}
      <Dialog open={showPdfCustomization} onOpenChange={setShowPdfCustomization}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-red-600" />
              Personalizar PDF
            </DialogTitle>
            <DialogDescription>
              Escolha quais colunas incluir no relatório PDF
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              💡 <strong>Dica:</strong> Desmarque as colunas que não quer no PDF. Por exemplo, tire "% Comissão" se não quiser mostrar percentuais, ou adicione "CPF" se precisar dessa informação.
            </div>

            {/* Colunas Básicas */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">📋 Colunas Básicas</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numero"
                    checked={pdfColumns.numero}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, numero: checked as boolean}))}
                  />
                  <label htmlFor="numero" className="text-sm font-medium">
                    # (Número)
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cliente"
                    checked={pdfColumns.cliente}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, cliente: checked as boolean}))}
                  />
                  <label htmlFor="cliente" className="text-sm font-medium">
                    Cliente
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="data"
                    checked={pdfColumns.data}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, data: checked as boolean}))}
                  />
                  <label htmlFor="data" className="text-sm font-medium">
                    Data
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="produto"
                    checked={pdfColumns.produto}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, produto: checked as boolean}))}
                  />
                  <label htmlFor="produto" className="text-sm font-medium">
                    Produto
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="status"
                    checked={pdfColumns.status}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, status: checked as boolean}))}
                  />
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>
                </div>
              </div>
            </div>

            {/* Colunas Financeiras */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">💰 Colunas Financeiras</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="valorVenda"
                    checked={pdfColumns.valorVenda}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, valorVenda: checked as boolean}))}
                  />
                  <label htmlFor="valorVenda" className="text-sm font-medium">
                    Valor da Venda
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="percentagem"
                    checked={pdfColumns.percentagem}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, percentagem: checked as boolean}))}
                  />
                  <label htmlFor="percentagem" className="text-sm font-medium">
                    % Comissão
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="valorComissao"
                    checked={pdfColumns.valorComissao}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, valorComissao: checked as boolean}))}
                  />
                  <label htmlFor="valorComissao" className="text-sm font-medium">
                    Valor Comissão
                  </label>
                </div>
              </div>
            </div>

            {/* Colunas Extras */}
            <div>
              <h4 className="font-medium text-gray-800 mb-3">📄 Colunas Extras</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cpf"
                    checked={pdfColumns.cpf}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, cpf: checked as boolean}))}
                  />
                  <label htmlFor="cpf" className="text-sm font-medium">
                    CPF
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="telefone"
                    checked={pdfColumns.telefone}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, telefone: checked as boolean}))}
                  />
                  <label htmlFor="telefone" className="text-sm font-medium">
                    Telefone
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="banco"
                    checked={pdfColumns.banco}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, banco: checked as boolean}))}
                  />
                  <label htmlFor="banco" className="text-sm font-medium">
                    Banco
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="observacoes"
                    checked={pdfColumns.observacoes}
                    onCheckedChange={(checked) => setPdfColumns(prev => ({...prev, observacoes: checked as boolean}))}
                  />
                  <label htmlFor="observacoes" className="text-sm font-medium">
                    Observações
                  </label>
                </div>
              </div>
            </div>

            {/* Contador de colunas selecionadas */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">
                📊 <strong>{Object.values(pdfColumns).filter(Boolean).length}</strong> colunas selecionadas
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPdfCustomization(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={generateCustomizedPDFReport}
              className="bg-red-600 hover:bg-red-700"
              disabled={Object.values(pdfColumns).filter(Boolean).length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Gerar PDF Personalizado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Configuração do WhatsApp */}
      <Dialog open={showWhatsAppConfig} onOpenChange={setShowWhatsAppConfig}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-green-600" />
              Configurar WhatsApp
            </DialogTitle>
            <DialogDescription>
              Escolha quais informações incluir na mensagem do WhatsApp
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
              💬 <strong>Dica:</strong> Desmarque as opções que não quer incluir na mensagem. Por exemplo, retire os valores de comissão se quiser enviar apenas informações sobre vendas.
            </div>

            {/* Opções de configuração */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeTotal"
                  checked={whatsAppConfig.includeTotal}
                  onCheckedChange={(checked) => setWhatsAppConfig(prev => ({...prev, includeTotal: checked as boolean}))}
                />
                <label htmlFor="includeTotal" className="text-sm font-medium">
                  💰 Incluir total de comissões no resumo
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeIndividualCommissions"
                  checked={whatsAppConfig.includeIndividualCommissions}
                  onCheckedChange={(checked) => setWhatsAppConfig(prev => ({...prev, includeIndividualCommissions: checked as boolean}))}
                />
                <label htmlFor="includeIndividualCommissions" className="text-sm font-medium">
                  📋 Incluir detalhamento individual das vendas
                </label>
              </div>

              {whatsAppConfig.includeIndividualCommissions && (
                <div className="ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includePercentages"
                      checked={whatsAppConfig.includePercentages}
                      onCheckedChange={(checked) => setWhatsAppConfig(prev => ({...prev, includePercentages: checked as boolean}))}
                    />
                    <label htmlFor="includePercentages" className="text-sm">
                      📊 Incluir percentuais (ex: 5.0%)
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCommissionValues"
                      checked={whatsAppConfig.includeCommissionValues}
                      onCheckedChange={(checked) => setWhatsAppConfig(prev => ({...prev, includeCommissionValues: checked as boolean}))}
                    />
                    <label htmlFor="includeCommissionValues" className="text-sm">
                      💵 Incluir valores de comissão (ex: R$ 150,00)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Preview da configuração */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-sm font-medium text-gray-700 mb-2">📱 Preview da mensagem:</div>
              <div className="text-xs text-gray-600 bg-white p-2 rounded border max-h-32 overflow-y-auto">
                {currentReportForWhatsApp && (
                  <div className="whitespace-pre-line">
                    {generateWhatsAppMessage(currentReportForWhatsApp, whatsAppConfig).substring(0, 200)}...
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWhatsAppConfig(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={sendWhatsAppReportWithConfig}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );

  function renderSingleEmployeeReport(report: any) {
    return (
      <div key={report.employee} className="bg-white border rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <h4 className="text-lg font-semibold">{report.employee}</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {report.totalLeads} vendas
            </Badge>
            <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
              R$ {report.totalCommissionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Badge>
          </div>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{report.totalLeads}</div>
            <div className="text-sm text-gray-600">Total de Vendas</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              R$ {report.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">Valor Total Vendido</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">
              R$ {report.totalCommissionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-600">Total Comissões</div>
          </div>
        </div>

        {/* Detalhamento (últimas 5 vendas para economizar espaço) */}
        <div className="space-y-2">
          <h5 className="font-medium text-gray-800">Últimas Vendas:</h5>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {report.commissions.slice(0, 5).map((commission: any, index: number) => {
              const leadDate = commission.lead?.date || commission.lead?.created_at;
              const dateFormatted = leadDate ? format(new Date(leadDate), 'dd/MM/yyyy') : 'N/A';
              
              return (
                <div key={commission.id} className="bg-gray-50 border rounded p-2 text-sm">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-800">
                      {commission.lead?.name || 'Cliente'}
                    </div>
                    <div className="text-xs text-gray-500">{dateFormatted}</div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {commission.product} • R$ {(commission.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} • 
                    <span className="font-semibold text-green-600 ml-1">
                      R$ {(commission.commission_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
            {report.commissions.length > 5 && (
              <div className="text-center text-sm text-gray-500 py-2">
                ... e mais {report.commissions.length - 5} vendas
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          <Button
            onClick={() => sendWhatsAppReport(report)}
            className="bg-green-600 hover:bg-green-700"
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar WhatsApp
          </Button>

          <Button
            onClick={() => openPdfCustomization(report)}
            className="bg-red-600 hover:bg-red-700"
            size="sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Gerar PDF
          </Button>

          {!report.commissions.every((c: any) => c.status === 'paid') && (
            <>
              <Button
                onClick={() => markCommissionsAsPaid(report.employee, report.commissions.map((c: any) => c.id))}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar como Pago
              </Button>

              <Button
                onClick={() => {
                  // Marcar todas as comissões como aprovadas
                  const commissionIds = report.commissions
                    .filter((c: any) => c.status !== 'approved' && c.status !== 'paid')
                    .map((c: any) => c.id);
                  
                  if (commissionIds.length > 0) {
                    Promise.all(
                      commissionIds.map((id: string) => changeCommissionStatus(id, 'approved'))
                    ).then(() => {
                      toast.success(`${commissionIds.length} comissões aprovadas!`);
                    });
                  } else {
                    toast.info('Todas as comissões já estão aprovadas ou pagas');
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700"
                size="sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar Todas
              </Button>
            </>
          )}


        </div>
      </div>
    );
  }
};

export default Commission;

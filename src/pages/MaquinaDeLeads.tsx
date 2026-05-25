import React, { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, CheckCircle, CreditCard, Gift, BookOpen, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MaquinaDeLeads = () => {
  const { user } = useAuth();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const price = 197.00;
  const originalPrice = 597.00;

  useEffect(() => {
    checkAccess();
  }, [user]);

  const checkAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await (supabase as any)
        .from('course_purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', 'curso-trafego-pago')
        .eq('status', 'paid')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar acesso:', error);
      }

      setHasAccess(!!data);
      
      if (data) {
        await loadPdf();
      }
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPdf = async () => {
    try {
      const { data } = await supabase.storage
        .from('courses')
        .getPublicUrl('curso-trafego-pago/curso.pdf');
      
      if (data?.publicUrl) {
        setPdfUrl(data.publicUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar PDF:', error);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para comprar o curso");
      return;
    }

    setProcessing(true);
    try {
      const { data: purchase, error: purchaseError } = await (supabase as any)
        .from('course_purchases')
        .insert({
          user_id: user.id,
          course_id: 'curso-trafego-pago',
          amount: price,
          status: 'pending',
          payment_method: 'manual'
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      toast.success("Redirecionando para pagamento...");
      
      setTimeout(async () => {
        const { error: updateError } = await (supabase as any)
          .from('course_purchases')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', purchase.id);

        if (updateError) throw updateError;

        toast.success("Pagamento confirmado! Acesso liberado!");
        setHasAccess(true);
        await loadPdf();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao processar compra:', error);
      toast.error(`Erro ao processar compra: ${error.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast.error("PDF não encontrado. Entre em contato com o suporte.");
    }
  };

  if (loading) {
    return (
      <PageLayout title="Curso de Tráfego Pago para Corbans" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Curso de Tráfego Pago para Corbans" subtitle="">
      {hasAccess ? (
        <div className="max-w-2xl mx-auto py-8 px-4">
          <Card className="border-2 border-green-500 shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8" />
                <h1 className="text-2xl font-bold">Acesso Liberado!</h1>
              </div>
              <p className="text-green-50">
                Você tem acesso completo ao Curso de Tráfego Pago para Corbans
              </p>
            </div>
            <CardContent className="p-8">
              <Button 
                onClick={handleDownload} 
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                Baixar Curso em PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-6">
          <Card className="border-3 border-yellow-400 bg-gradient-to-br from-white via-yellow-50/30 to-orange-50/50 shadow-2xl relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-200/20 rounded-full blur-2xl"></div>
            
            <CardHeader className="text-center p-5 sm:p-7 relative z-10">
              <Badge className="w-fit mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-3 text-xs sm:text-sm px-3 sm:px-4 py-1 font-bold shadow-lg">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 inline" />
                Curso em PDF
              </Badge>
              
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 mb-6 leading-tight">
                Curso de Tráfego Pago<br />
                <span className="text-blue-600">para Corbans</span>
              </CardTitle>
              
              {/* Preço Destacado */}
              <div className="my-6 bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-orange-200 shadow-lg">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-black text-orange-600">R$ 197</span>
                  <span className="text-xl sm:text-2xl font-bold text-gray-600">,00</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <p className="text-sm text-gray-500 line-through">De R$597,00</p>
                  <Badge className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-3 py-1 font-bold shadow-md">
                    67% OFF
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 font-medium">Economize R$400,00</p>
              </div>
              
              {/* Bônus - SUPER DESTACADO */}
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 border-3 border-green-700 rounded-xl p-5 mb-5 shadow-2xl transform hover:scale-[1.02] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Gift className="w-7 h-7 text-white animate-pulse" />
                    <h3 className="font-black text-white text-lg sm:text-xl drop-shadow-lg">
                      BÔNUS EXCLUSIVO AO COMPRAR!
                    </h3>
                  </div>
                  <div className="bg-white/25 backdrop-blur-md rounded-lg p-4 border border-white/30">
                    <p className="text-white font-black text-lg sm:text-xl text-center mb-2 drop-shadow-md">
                      🎁 TEMPLATES PRONTOS + PLANILHAS BÔNUS
                    </p>
                    <p className="text-white/95 text-sm text-center font-medium">
                      Receba templates prontos de campanhas para Google Ads, Facebook e Instagram + planilhas de gestão e acompanhamento de ROI
                    </p>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Curso */}
              <div className="text-left mb-5 bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                <p className="text-sm sm:text-base font-bold text-gray-900 mb-4 text-center">📚 O que você vai aprender:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium">Como criar campanhas no Google Ads</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium">Anúncios no Facebook e Instagram</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium">Segmentação de público para Corbans</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium">Leads para INSS, FGTS e Bolsa Família</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium">Otimização de campanhas e ROI</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-medium">Funil de vendas que converte</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardFooter className="p-5 sm:p-7 relative z-10">
              <Button 
                onClick={handlePurchase}
                disabled={processing}
                className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 hover:from-orange-700 hover:via-orange-600 hover:to-orange-700 text-white text-base sm:text-lg py-4 sm:py-5 font-black shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all rounded-xl" 
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2 inline" />
                    COMPRAR CURSO AGORA
                    <ArrowRight className="w-5 h-5 ml-2 inline" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default MaquinaDeLeads;

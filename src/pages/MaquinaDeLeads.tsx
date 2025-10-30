import React, { useState, useEffect } from "react";
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, CheckCircle, Star, CreditCard, Shield, Clock, 
  ArrowRight, Sparkles, Rocket
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
  const originalPrice = 497.00;

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
        .eq('course_id', 'trafegopago-corban')
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
        .getPublicUrl('trafegopago-corban/curso.pdf');
      
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
          course_id: 'trafegopago-corban',
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
      <PageLayout title="Máquina de Vendas" subtitle="Carregando...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Máquina de Vendas" subtitle="Curso avançado de tráfego pago para Corbanistas">
      {hasAccess ? (
        <div className="max-w-2xl mx-auto py-8 px-4">
          <Card className="border-2 border-green-500 shadow-2xl">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8" />
                <h1 className="text-2xl font-bold">Acesso Liberado!</h1>
              </div>
              <p className="text-green-50">
                Você tem acesso completo ao curso <strong>Máquina de Vendas</strong> — Tráfego Pago para Corban
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-2xl overflow-hidden mb-4 shadow-2xl">
            <div className="relative z-10 p-6 md:p-8">
              <div className="max-w-2xl mx-auto text-center">
                <Badge className="mb-4 bg-yellow-400 text-slate-900 px-3 py-1.5 text-xs font-black">
                  60% OFF
                </Badge>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
                  Domine o Tráfego Pago para Corban
                  <span className="block text-yellow-300">Venda Todos os Dias!</span>
                </h1>
                <p className="text-lg text-white mb-6">
                  O curso mais completo do Brasil em tráfego pago 100% prático feito para quem atua como corban.
                </p>
                {/* Preço */}
                <Card className="bg-white border-4 border-yellow-500 shadow-2xl max-w-sm mx-auto">
                  <CardContent className="p-5">
                    <div className="text-center mb-4">
                      <p className="text-xs text-gray-500 mb-1">De <span className="line-through">R$ {originalPrice.toFixed(2).replace('.', ',')}</span></p>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-5xl font-black text-slate-900">R$ {price.toFixed(0)}</span>
                        <span className="text-2xl text-slate-700 font-black">,00</span>
                      </div>
                      <Badge className="bg-red-600 text-white text-xs px-2 py-0.5 font-bold">
                        Economize R$ {(originalPrice - price).toFixed(2).replace('.', ',')}
                      </Badge>
                    </div>
                    <Button 
                      onClick={handlePurchase}
                      disabled={processing}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-base py-6 rounded-lg shadow-xl mb-3"
                      size="lg"
                    >
                      {processing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          COMPRAR AGORA
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                    <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                      <Shield className="h-3 w-3" />
                      <Clock className="h-3 w-3" />
                      <CheckCircle className="h-3 w-3" />
                      <span>Seguro • Imediato • Garantia 7d</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          {/* Conteúdo Essencial - Compacto */}
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            {/* O Que Você Vai Aprender */}
            <Card className="border-2 md:col-span-2">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 border-b">
                <h3 className="text-base font-bold text-gray-900">Você vai aprender no <span className='text-blue-600'>Máquina de Vendas</span>:</h3>
              </div>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    "Criação de campanhas no Meta Ads do zero",
                    "Funil de vendas digital de fácil execução para Corban",
                    "Como vender crédito consignado todos os dias no digital",
                    "Estratégias de criativos, copy e segmentação para o público 50+",
                    "Como operar dentro das regras do BACEN para Corbanistas",
                    "Acesso a modelos validados e acompanhamento das campanhas"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Garantia + Depoimento */}
            <div className="space-y-3">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-lg">
                <CardContent className="p-4 text-center">
                  <Shield className="h-7 w-7 mx-auto mb-2" />
                  <h3 className="text-sm font-bold mb-1">Garantia 7 Dias</h3>
                  <p className="text-xs text-green-50">
                    100% do dinheiro de volta.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-2.5 border-b">
                  <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    Depoimento
                  </h3>
                </div>
                <CardContent className="p-2.5">
                  <div className="border-l-2 border-blue-500 pl-2">
                    <div className="flex gap-0.5 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-700 mb-0.5 italic">
                      "Nunca imaginei fechar tanto negócio online! O método é prático e direto. Recomendo para todo Corban."
                    </p>
                    <p className="text-xs font-semibold text-gray-900">Carlos Silva</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* CTA Final */}
          <Card className="bg-gradient-to-r from-slate-900 to-blue-900 text-white border-0 shadow-2xl">
            <CardContent className="p-5 text-center">
              <Rocket className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
              <h2 className="text-xl font-bold mb-2">APROVEITE - ACESSO IMEDIATO!</h2>
              <p className="text-sm text-white mb-4">
                Seu atalho definitivo para geração de contratos de crédito via tráfego pago!
              </p>
              <div className="max-w-xs mx-auto">
                <div className="mb-3">
                  <p className="text-xs text-blue-200 mb-0.5">De <span className="line-through">R$ {originalPrice.toFixed(2).replace('.', ',')}</span></p>
                  <p className="text-3xl font-black text-yellow-400 mb-1">R$ {price.toFixed(0)},00</p>
                  <Badge className="bg-red-500 text-white text-xs">60% OFF</Badge>
                </div>
                <Button 
                  onClick={handlePurchase}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-slate-900 font-bold py-5 rounded-lg shadow-xl transform hover:scale-105 transition-all"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      QUERO MEU ACESSO AGORA!
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default MaquinaDeLeads;

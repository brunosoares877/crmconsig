
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import PageLayout from "@/components/PageLayout";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { isSubscriptionActive, refreshSubscription } = useSubscription();

  // SEGURANÇA: Não ativamos assinatura automaticamente aqui
  // A assinatura deve ser ativada apenas após confirmação real de pagamento
  // Por enquanto, até implementar gateway de pagamento, ativação é manual via admin

  const handleRefresh = async () => {
    await refreshSubscription();
    if (isSubscriptionActive) {
      navigate("/dashboard");
    }
  };

  return (
    <PageLayout showTrialBanner={false}>
      <div className="container mx-auto p-4 py-16 flex flex-col items-center">
        <Card className="max-w-md w-full mx-auto border-2 border-blue-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              {isSubscriptionActive ? (
                <CheckCircle className="h-10 w-10 text-green-600" />
              ) : (
                <Clock className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <CardTitle className="text-2xl text-blue-800">
              {isSubscriptionActive ? "Assinatura Ativa!" : "Pagamento em Processamento"}
            </CardTitle>
            <CardDescription>
              {isSubscriptionActive
                ? "Sua assinatura foi confirmada com sucesso"
                : "Aguardando confirmação do pagamento"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {isSubscriptionActive ? (
              <>
                <div className="text-center py-4 border-t border-b border-green-100">
                  <p className="font-medium text-lg">Bem-vindo ao LeadConsig Premium!</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Agora você tem acesso completo a todas as funcionalidades
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => navigate("/dashboard")}
                  >
                    Ir para o Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-green-200 text-green-600 hover:bg-green-50"
                    onClick={() => navigate("/leads")}
                  >
                    Gerenciar Leads
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center py-4 border-t border-b border-blue-100">
                  <p className="font-medium text-lg">Obrigado pela sua compra!</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Estamos processando seu pagamento. Sua assinatura será ativada em breve.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Próximos passos:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-800">
                        <li>Aguarde a confirmação do pagamento (pode levar alguns minutos)</li>
                        <li>Você receberá um email de confirmação</li>
                        <li>Sua assinatura será ativada automaticamente</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleRefresh}
                  >
                    Verificar Status da Assinatura
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate("/dashboard")}
                  >
                    Voltar ao Dashboard
                  </Button>
                </div>
              </>
            )}

            <p className="text-xs text-muted-foreground text-center mt-6">
              Em caso de dúvidas, entre em contato com nosso suporte pelo email: suporte@leadconsig.com.br
            </p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default SubscriptionSuccess;

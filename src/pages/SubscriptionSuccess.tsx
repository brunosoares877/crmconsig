
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import PageLayout from "@/components/PageLayout";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { activateSubscription } = useSubscription();
  
  useEffect(() => {
    // Ativar assinatura por 1 ano a partir de hoje
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    activateSubscription(oneYearFromNow.toISOString());
  }, [activateSubscription]);
  
  return (
    <PageLayout showTrialBanner={false}>
      <div className="container mx-auto p-4 py-16 flex flex-col items-center">
        <Card className="max-w-md w-full mx-auto border-2 border-green-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Pagamento Confirmado!</CardTitle>
            <CardDescription>
              Sua assinatura foi ativada com sucesso
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
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

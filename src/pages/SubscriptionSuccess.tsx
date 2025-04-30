
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 py-16 flex flex-col items-center">
        <Card className="max-w-md w-full mx-auto border-2 border-green-500/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Assinatura Confirmada!</CardTitle>
            <CardDescription>
              Seu pagamento foi processado com sucesso
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center py-4 border-t border-b">
              <p className="font-medium text-lg">Obrigado por escolher o LeadConsig!</p>
              <p className="text-muted-foreground text-sm mt-2">
                Já liberamos acesso completo à sua conta.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate("/dashboard")}
              >
                Ir para o Dashboard
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
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
      </main>
    </div>
  );
};

export default SubscriptionSuccess;

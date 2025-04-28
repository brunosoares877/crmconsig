
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const SubscriptionCancelled = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto p-4 py-16 flex flex-col items-center">
        <Card className="max-w-md w-full mx-auto border-2 border-gray-200">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <XCircle className="h-10 w-10 text-gray-500" />
            </div>
            <CardTitle className="text-2xl">Assinatura Cancelada</CardTitle>
            <CardDescription>
              O processo de pagamento foi cancelado
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center py-4 border-t border-b">
              <p className="font-medium text-lg">Sentimos muito pelo cancelamento</p>
              <p className="text-muted-foreground text-sm mt-2">
                Você pode tentar novamente quando quiser
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => navigate("/plans")}
              >
                Tentar Novamente
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                Voltar ao Dashboard
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center mt-6">
              Em caso de dúvidas, entre em contato com nosso suporte pelo email: suporte@leadconsig.com
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SubscriptionCancelled;

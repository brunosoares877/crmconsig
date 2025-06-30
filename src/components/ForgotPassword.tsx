import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, ArrowLeft, Phone, HelpCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getResetPasswordURL, debugDomainConfig, getDomainInfo, getBaseURL } from '@/utils/domainConfig';
import { toast } from 'sonner';

interface ForgotPasswordProps {
  onBack: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [recoveryMethod, setRecoveryMethod] = useState<'email' | 'support'>('email');
  const [resendCounter, setResendCounter] = useState(0);

  // Debug da configuração de domínio na primeira carga
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      debugDomainConfig();
    }
  }, []);

  const handleEmailRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Por favor, digite um email válido.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const domainInfo = getDomainInfo();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${domainInfo.baseURL}/reset-password`,
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: `Email de recuperação enviado para ${email}. Verifique sua caixa de entrada e spam.` 
      });
      setResendCounter(prev => prev + 1);
    } catch (error: any) {
      console.error('Erro ao enviar email de recuperação:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erro ao enviar email de recuperação. Tente novamente.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <CardTitle className="text-2xl">Recuperar Conta</CardTitle>
            <CardDescription>
              Escolha como você deseja recuperar sua conta
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Seletor de Método */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant={recoveryMethod === 'email' ? 'default' : 'outline'}
            onClick={() => setRecoveryMethod('email')}
            className="flex items-center gap-2 h-12"
          >
            <Mail className="h-4 w-4" />
            Via Email
          </Button>
          
          <Button
            variant={recoveryMethod === 'support' ? 'default' : 'outline'}
            onClick={() => setRecoveryMethod('support')}
            className="flex items-center gap-2 h-12"
          >
            <HelpCircle className="h-4 w-4" />
            Suporte Manual
          </Button>
        </div>

        <Separator />

        {/* Formulário Email */}
        {recoveryMethod === 'email' && (
          <form onSubmit={handleEmailRecovery} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email da Conta</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-11"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email de Recuperação
                </>
              )}
            </Button>

            {resendCounter > 0 && (
              <p className="text-xs text-gray-500 text-center">
                Email enviado {resendCounter} vez(es). Verifique também a pasta de spam.
              </p>
            )}
          </form>
        )}

        {/* Suporte Manual */}
        {recoveryMethod === 'support' && (
          <div className="space-y-4">
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Suporte Manual:</strong><br />
                Entre em contato conosco pelos canais abaixo com as seguintes informações:
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm">
              <div>
                <strong>Informações necessárias:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>Nome completo</li>
                  <li>CPF (últimos 4 dígitos)</li>
                  <li>WhatsApp alternativo</li>
                  <li>Data aproximada da criação da conta</li>
                </ul>
              </div>

              <div>
                <strong>Canais de Contato:</strong>
                <ul className="mt-1 ml-4 list-disc space-y-1">
                  <li>WhatsApp: (11) 99999-9999</li>
                  <li>Email: suporte@leadconsig.com.br</li>
                  <li>Horário: Segunda a Sexta, 9h às 18h</li>
                </ul>
              </div>
            </div>

            <Button 
              className="w-full h-11" 
              onClick={() => window.open('https://wa.me/5511999999999', '_blank')}
            >
              <Phone className="h-4 w-4 mr-2" />
              Entrar em Contato
            </Button>
          </div>
        )}

        {/* Mensagem de Feedback */}
        {message && (
          <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
            <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Debug de Configuração */}
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              const config = getDomainInfo();
              alert(`Debug - Configuração Atual:\n\nAmbiente: ${config.environment}\nURL Configurada: ${config.baseURL}\n\nPara alterar, edite src/utils/domainConfig.ts`);
            }}
            className="text-xs"
          >
            Ver Config Domínio
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 
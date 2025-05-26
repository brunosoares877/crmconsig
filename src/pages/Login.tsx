
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, Key, UserPlus, Building, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import TypewriterText from "@/components/TypewriterText";

const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

const SignupSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  company: z.string().min(2, "Nome da empresa é obrigatório"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().regex(phoneRegex, "WhatsApp inválido - use o formato (99) 99999-9999"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(6, "A confirmação de senha é obrigatória")
}).refine(data => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"]
});

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { startTrial } = useSubscription();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const maskPhone = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Apply mask (99) 99999-9999
    if (digits.length <= 2) {
      return `(${digits}`;
    }
    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWhatsapp(maskPhone(e.target.value));
  };

  const validateForm = () => {
    try {
      if (isLogin) {
        LoginSchema.parse({ email, password });
      } else {
        SignupSchema.parse({
          fullName,
          company,
          email,
          whatsapp,
          password,
          confirmPassword
        });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      console.log("Iniciando login com Google...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      console.log("Resposta do Google OAuth:", { data, error });

      if (error) {
        console.error("Erro no Google OAuth:", error);
        
        // Mensagens de erro mais específicas
        if (error.message.includes('provider is not enabled')) {
          toast.error("O login com Google não está habilitado. Entre em contato com o administrador.");
        } else if (error.message.includes('invalid_request')) {
          toast.error("Configuração do Google OAuth inválida. Verifique as configurações no Supabase.");
        } else {
          toast.error(`Erro ao fazer login com Google: ${error.message}`);
        }
        return;
      }

      // Se chegou até aqui, o redirecionamento para o Google foi iniciado
      console.log("Redirecionamento para Google iniciado");
      
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado ao fazer login com Google. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Login realizado com sucesso");
      } else {
        // Register user with all form data
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: company,
              whatsapp: whatsapp
            }
          }
        });
        
        if (error) throw error;

        // Update the profile in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            company_name: company,
            first_name: fullName.split(' ')[0],
            last_name: fullName.split(' ').slice(1).join(' ')
          })
          .eq('id', (await supabase.auth.getUser()).data.user?.id);
          
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        
        startTrial(); // Start the 7-day trial
        toast.success("Conta criada com sucesso! Seu período de teste de 7 dias começou.");

        // Auto-login after signup
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error("Erro na autenticação:", error);
      toast.error(error.message || "Ocorreu um erro ao processar sua solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Login form with white background */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-md animate-fade-in shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-slate-900">LeadConsig</CardTitle>
            <CardDescription className="text-center font-medium text-gray-600">
              O CRM feito para{" "}
              <span className="text-blue-600 font-semibold">
                <TypewriterText text="alavancar suas vendas" speed={80} />
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button 
                variant="outline" 
                className="w-full bg-white border-gray-200 hover:bg-gray-50" 
                onClick={handleGoogleSignIn} 
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Entrar com Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    ou continue com email
                  </span>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <div className="relative">
                      <Input 
                        id="fullName" 
                        placeholder="Seu nome completo" 
                        type="text" 
                        required 
                        className={errors.fullName ? "border-destructive" : ""} 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)} 
                        disabled={isLoading} 
                      />
                    </div>
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da Empresa</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="company" 
                        type="text" 
                        required 
                        placeholder="Sua empresa" 
                        className={`pl-10 ${errors.company ? "border-destructive" : ""}`} 
                        value={company} 
                        onChange={(e) => setCompany(e.target.value)} 
                        disabled={isLoading} 
                      />
                    </div>
                    {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="whatsapp" 
                        type="text" 
                        required 
                        placeholder="(99) 99999-9999" 
                        className={`pl-10 ${errors.whatsapp ? "border-destructive" : ""}`} 
                        value={whatsapp} 
                        onChange={handlePhoneChange} 
                        maxLength={15} 
                        disabled={isLoading} 
                      />
                    </div>
                    {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp}</p>}
                  </div>
                </>
              )}
            
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <LogIn className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="seu@email.com" 
                    type="email" 
                    required 
                    autoComplete="email" 
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`} 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    disabled={isLoading} 
                  />
                </div>
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    autoComplete={isLogin ? "current-password" : "new-password"} 
                    className={`pl-10 ${errors.password ? "border-destructive" : ""}`} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    disabled={isLoading} 
                  />
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      required 
                      autoComplete="new-password" 
                      className={`pl-10 ${errors.confirmPassword ? "border-destructive" : ""}`} 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      disabled={isLoading} 
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                    {isLogin ? "Entrando..." : "Criando conta..."}
                  </>
                ) : (
                  <>
                    {isLogin ? (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Criar Conta
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex gap-4 w-full">
              <Button 
                variant="outline" 
                className="w-full border-gray-200 hover:bg-gray-50" 
                onClick={() => setIsLogin(!isLogin)} 
                disabled={isLoading}
              >
                {isLogin ? "Criar conta" : "Já tem uma conta? Faça login"}
              </Button>
            </div>
            
            {isLogin && (
              <p className="text-sm text-gray-500 text-center">
                Esqueceu a senha? Entre em contato com o administrador
              </p>
            )}
          </CardFooter>
        </Card>
      </div>
      
      {/* Right side - Brand/Image with blue background */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-b from-blue-600 to-blue-800 items-center justify-center text-white p-8">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold mb-6">LeadConsig</h1>
          <p className="text-xl mb-8">Transforme seus leads em clientes com nossa solução completa de gestão de vendas.</p>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-300 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p>Acompanhamento completo do ciclo de vendas</p>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-300 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p>Relatórios e análises detalhadas</p>
            </div>
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-300 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p>Integração com ferramentas de comunicação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

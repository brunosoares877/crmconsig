import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, Key, UserPlus, Building, Phone, Eye, EyeOff } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <div className="w-4 h-4 bg-white rounded-sm"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LeadConsig</h1>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "Bem-vindo de volta" : "Criar conta"}
            </h2>
            <p className="text-gray-600">
              {isLogin 
                ? "Digite seu email e senha para acessar sua conta." 
                : "Preencha os dados abaixo para criar sua conta."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-900">
                    Nome Completo
                  </Label>
                  <Input 
                    id="fullName" 
                    placeholder="Seu nome completo" 
                    type="text" 
                    required 
                    className={`h-12 border-gray-300 ${errors.fullName ? "border-red-500" : ""}`}
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    disabled={isLoading} 
                  />
                  {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-900">
                    Nome da Empresa
                  </Label>
                  <Input 
                    id="company" 
                    type="text" 
                    required 
                    placeholder="Sua empresa" 
                    className={`h-12 border-gray-300 ${errors.company ? "border-red-500" : ""}`}
                    value={company} 
                    onChange={(e) => setCompany(e.target.value)} 
                    disabled={isLoading} 
                  />
                  {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-900">
                    WhatsApp
                  </Label>
                  <Input 
                    id="whatsapp" 
                    type="text" 
                    required 
                    placeholder="(99) 99999-9999" 
                    className={`h-12 border-gray-300 ${errors.whatsapp ? "border-red-500" : ""}`}
                    value={whatsapp} 
                    onChange={handlePhoneChange} 
                    maxLength={15} 
                    disabled={isLoading} 
                  />
                  {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp}</p>}
                </div>
              </>
            )}
          
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-900">
                Email
              </Label>
              <Input 
                id="email" 
                placeholder="seuemail@empresa.com" 
                type="email" 
                required 
                autoComplete="email" 
                className={`h-12 border-gray-300 ${errors.email ? "border-red-500" : ""}`}
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading} 
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-900">
                Senha
              </Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  required 
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"} 
                  className={`h-12 border-gray-300 pr-12 ${errors.password ? "border-red-500" : ""}`}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  disabled={isLoading} 
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input 
                    id="confirmPassword" 
                    type={showPassword ? "text" : "password"}
                    required 
                    placeholder="••••••••"
                    autoComplete="new-password" 
                    className={`h-12 border-gray-300 pr-12 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    disabled={isLoading} 
                  />
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Lembrar de mim
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Esqueceu sua senha?
                  </a>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                  {isLogin ? "Entrando..." : "Criando conta..."}
                </>
              ) : (
                isLogin ? "Entrar" : "Criar conta"
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-gray-50 px-3 text-gray-500">
                  Ou entre com
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full h-12 border-gray-300" 
                onClick={handleGoogleSignIn} 
                disabled={isLoading}
                type="button"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full h-12 border-gray-300"
                disabled={isLoading}
                type="button"
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-medium text-blue-600 hover:text-blue-500"
                disabled={isLoading}
              >
                {isLogin ? "Cadastre-se agora" : "Faça login"}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Right side - Promotional content */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-white/20"></div>
          <div className="absolute bottom-40 right-32 w-24 h-24 rounded-full bg-white/15"></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 rounded-full bg-white/10"></div>
        </div>
        
        <div className="max-w-lg relative z-10 text-white">
          <h1 className="text-4xl font-bold mb-6 leading-tight">
            Gerencie eficientemente sua equipe e operações
          </h1>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Faça login para acessar seu dashboard CRM e gerenciar sua equipe.
          </p>
          
          {/* Dashboard preview mockup */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">R$ 189.374</div>
                <div className="text-sm opacity-75">Receita Total</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-2xl font-bold">6.248</div>
                <div className="text-sm opacity-75">Leads</div>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm opacity-75">Performance da Equipe</span>
                <span className="text-sm">85%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full w-4/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
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
  const {
    signIn,
    signUp
  } = useAuth();
  const {
    startTrial
  } = useSubscription();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const maskPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
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
        LoginSchema.parse({
          email,
          password
        });
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
      const {
        data,
        error
      } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) {
        if (error.message.includes('provider is not enabled') || error.message.includes('validation_failed')) {
          toast.error("Login com Google não configurado. Configure no painel do Supabase em Authentication → Providers.");
        } else if (error.message.includes('invalid_request')) {
          toast.error("Configuração do Google OAuth inválida. Verifique as configurações no Supabase.");
        } else {
          toast.error(`Erro ao fazer login com Google: ${error.message}`);
        }
        return;
      }
    } catch (error: any) {
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
        const {
          error
        } = await supabase.auth.signUp({
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
        const {
          error: profileError
        } = await supabase.from('profiles').update({
          company_name: company,
          first_name: fullName.split(' ')[0],
          last_name: fullName.split(' ').slice(1).join(' ')
        }).eq('id', (await supabase.auth.getUser()).data.user?.id);
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        startTrial();
        toast.success("Conta criada com sucesso! Seu período de teste de 7 dias começou.");
        await signIn(email, password);
      }
    } catch (error: any) {
      console.error("Erro na autenticação:", error);
      toast.error(error.message || "Ocorreu um erro ao processar sua solicitação");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="w-full h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-between px-8">
      {/* Lado esquerdo - Texto promocional */}
      <div className="flex-1 max-w-lg text-white my-0 mx-[176px]">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <div className="w-6 h-6 bg-blue-600 rounded-sm"></div>
          </div>
          <h1 className="text-3xl font-bold">LeadConsig</h1>
        </div>
        
        <div className="mb-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-200 text-xs font-medium mb-6">
            ✨ Novidade
          </div>
          <h2 className="text-4xl font-bold mb-4 leading-tight">
            Gerencie seus leads com{" "}
            <span className="bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">
              inteligência
            </span>
          </h2>
          <p className="text-lg text-blue-100 leading-relaxed">
            Sistema completo para gestão de leads, agendamentos e comissões.
          </p>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="flex-1 max-w-md ml-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full px-[31px] py-[99px] my-[9px] mx-0">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {isLogin ? "Login" : "Criar conta"}
            </h3>
            <p className="text-gray-600 text-sm">
              {isLogin ? "Entre na sua conta para continuar" : "Crie sua conta e comece agora"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    Nome Completo
                  </Label>
                  <Input id="fullName" placeholder="Seu nome completo" type="text" required className={`h-10 rounded-lg border-gray-300 text-sm ${errors.fullName ? "border-red-500" : ""}`} value={fullName} onChange={e => setFullName(e.target.value)} disabled={isLoading} />
                  {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                    Nome da Empresa
                  </Label>
                  <Input id="company" type="text" required placeholder="Sua empresa" className={`h-10 rounded-lg border-gray-300 text-sm ${errors.company ? "border-red-500" : ""}`} value={company} onChange={e => setCompany(e.target.value)} disabled={isLoading} />
                  {errors.company && <p className="text-xs text-red-500">{errors.company}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                    WhatsApp
                  </Label>
                  <Input id="whatsapp" type="text" required placeholder="(99) 99999-9999" className={`h-10 rounded-lg border-gray-300 text-sm ${errors.whatsapp ? "border-red-500" : ""}`} value={whatsapp} onChange={handlePhoneChange} maxLength={15} disabled={isLoading} />
                  {errors.whatsapp && <p className="text-xs text-red-500">{errors.whatsapp}</p>}
                </div>
              </>}
          
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-mail ou usuário
              </Label>
              <Input id="email" placeholder="seuemail@empresa.com" type="email" required autoComplete="email" className={`h-10 rounded-lg border-gray-300 text-sm ${errors.email ? "border-red-500" : ""}`} value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} required placeholder="••••••••" autoComplete={isLogin ? "current-password" : "new-password"} className={`h-10 rounded-lg border-gray-300 pr-10 text-sm ${errors.password ? "border-red-500" : ""}`} value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {!isLogin && <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirmar Senha
                </Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showPassword ? "text" : "password"} required placeholder="••••••••" autoComplete="new-password" className={`h-10 rounded-lg border-gray-300 pr-10 text-sm ${errors.confirmPassword ? "border-red-500" : ""}`} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading} />
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>}

            <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg text-sm" disabled={isLoading}>
              {isLoading ? <>
                  <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-t-transparent"></div>
                  {isLogin ? "Entrando..." : "Criando conta..."}
                </> : isLogin ? "Continuar" : "Criar conta"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-500">
                  Ou
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full h-10 border-gray-300 rounded-lg hover:bg-gray-50 text-sm" onClick={handleGoogleSignIn} disabled={isLoading} type="button">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar com o Google
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
              <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-blue-600 hover:text-blue-500" disabled={isLoading}>
                {isLogin ? "Cadastrar" : "Fazer login"}
              </button>
            </p>
          </div>

          <div className="mt-3 text-center">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <a href="#" className="hover:text-gray-700">Termos e privacidade</a>
              <span>Português (Brasil)</span>
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Login;
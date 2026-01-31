import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { ForgotPassword } from "@/components/ForgotPassword";

const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/;
const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});
const SignupSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  email: z.string().email("Email inválido"),
  whatsapp: z.string().regex(phoneRegex, "WhatsApp inválido - use o formato (99) 99999-9999"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
});

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { startTrial } = useSubscription();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
        LoginSchema.parse({ email, password });
      } else {
        SignupSchema.parse({ fullName, email, whatsapp, password });
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

      console.log('[Google OAuth] Iniciando processo de login...');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('[Google OAuth] Erro retornado:', {
          message: error.message,
          status: error.status,
          name: error.name,
        });

        // Erros específicos com mensagens claras
        if (error.message.includes('provider is not enabled') ||
          error.message.includes('provider_disabled')) {
          toast.error(
            "Login com Google não está ativado",
            {
              description: "Entre em contato com o suporte para ativar esta funcionalidade.",
              duration: 6000,
            }
          );
          console.error('[Google OAuth] Provider não habilitado no Supabase');
        }
        else if (error.message.includes('validation_failed') ||
          error.message.includes('invalid_request')) {
          toast.error(
            "Configuração do Google OAuth incompleta",
            {
              description: "O administrador precisa configurar as credenciais do Google no Supabase.",
              duration: 6000,
            }
          );
          console.error('[Google OAuth] Credenciais OAuth inválidas ou não configuradas');
        }
        else if (error.message.includes('redirect_uri_mismatch')) {
          toast.error(
            "URL de redirecionamento não autorizada",
            {
              description: `A URL ${window.location.origin} precisa ser adicionada nas URLs autorizadas do Google Cloud Console.`,
              duration: 8000,
            }
          );
          console.error('[Google OAuth] Redirect URI não autorizada:', window.location.origin);
        }
        else if (error.message.includes('popup_closed_by_user')) {
          toast.info("Login cancelado", {
            description: "Você fechou a janela de login do Google.",
            duration: 3000,
          });
          console.log('[Google OAuth] Usuário cancelou o login');
        }
        else if (error.message.includes('network') || error.message.includes('fetch')) {
          toast.error(
            "Erro de conexão",
            {
              description: "Verifique sua conexão com a internet e tente novamente.",
              duration: 5000,
            }
          );
          console.error('[Google OAuth] Erro de rede');
        }
        else {
          toast.error(
            "Erro ao fazer login com Google",
            {
              description: error.message || "Tente novamente ou use login com email.",
              duration: 6000,
            }
          );
          console.error('[Google OAuth] Erro não tratado:', error);
        }
        return;
      }

      // Sucesso - usuário será redirecionado
      console.log('[Google OAuth] Redirecionando para autenticação...');
      toast.success("Redirecionando para o Google...", {
        description: "Aguarde enquanto abrimos a página de login.",
        duration: 2000,
      });

    } catch (error: any) {
      console.error('[Google OAuth] Exceção capturada:', error);

      toast.error(
        "Erro inesperado no login com Google",
        {
          description: "Por favor, tente fazer login com email e senha ou entre em contato com o suporte.",
          duration: 6000,
        }
      );
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
        const { data: authData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              whatsapp: whatsapp
            }
          }
        });
        if (error) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              first_name: fullName.split(' ')[0],
              last_name: fullName.split(' ').slice(1).join(' '),
              whatsapp: whatsapp
            })
            .eq('id', authData.user.id);
          if (profileError) {
            console.error("Error updating profile:", profileError);
          }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* Container principal com animação de entrada */}
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center animate-in fade-in duration-1000">

          {/* Lado esquerdo - Conteúdo promocional */}
          <div className="hidden lg:flex flex-col justify-center space-y-10 px-8 overflow-visible">
            <div className="space-y-8 overflow-visible">
              {/* Badge de novidade com animação */}
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/15 to-indigo-500/15 border border-blue-200/60 backdrop-blur-sm shadow-lg animate-in slide-in-from-left duration-700 delay-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></div>
                <span className="text-blue-700 text-sm font-semibold">✨ Sistema Completo de CRM</span>
              </div>

              {/* Título principal com gradiente */}
              <div className="space-y-6 overflow-visible">
                <div className="overflow-visible p-2 -m-2 animate-in slide-in-from-left duration-700 delay-300">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-[1.2] tracking-tight text-gray-900 overflow-visible"
                    style={{ letterSpacing: '-0.02em' }}>
                    Gerencie seus leads com
                    <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mt-2 animate-in slide-in-from-left duration-700 delay-500">
                      inteligência
                    </span>
                  </h1>
                </div>
                <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed animate-in slide-in-from-left duration-700 delay-700">
                  Transforme leads em resultados com nossa plataforma completa de gestão e automação.
                </p>
              </div>
            </div>

            {/* Features com ícones melhorados */}
            <div className="space-y-6 animate-in slide-in-from-left duration-700 delay-900">
              <div className="flex items-center space-x-4 text-gray-700 group hover:text-gray-900 transition-colors duration-300">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg font-medium">Dashboard com métricas em tempo real</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-700 group hover:text-gray-900 transition-colors duration-300">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg font-medium">Relatórios de comissão automáticos</span>
              </div>
              <div className="flex items-center space-x-4 text-gray-700 group hover:text-gray-900 transition-colors duration-300">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg font-medium">Filtros personalizados</span>
              </div>
            </div>

            {/* Estatísticas impressionantes */}
            <div className="grid grid-cols-3 gap-6 pt-6 animate-in slide-in-from-left duration-700 delay-1100">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-600">Leads/mês</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">99%</div>
                <div className="text-sm text-gray-600">Satisfação</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">Rápido</div>
                <div className="text-sm text-gray-600">Suporte</div>
              </div>
            </div>
          </div>

          {/* Lado direito - Formulário */}
          <div className="w-full max-w-lg mx-auto">
            {showForgotPassword ? (
              <ForgotPassword onBack={() => setShowForgotPassword(false)} />
            ) : (
              <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-10 transition-all duration-500 hover:shadow-3xl hover:scale-[1.02] animate-in slide-in-from-right duration-700 delay-200">

                {/* Header do formulário */}
                <div className="text-center mb-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl mb-6 shadow-lg">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {isLogin ? "Bem-vindo de volta" : "Criar sua conta"}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {isLogin ? "Entre na sua conta para continuar" : "Comece seu período de teste gratuito"}
                  </p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="space-y-7">

                  {/* Campos do cadastro */}
                  {!isLogin && (
                    <div className="space-y-6 animate-in slide-in-from-top duration-500 delay-300">
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          Nome Completo
                        </Label>
                        <Input
                          id="fullName"
                          placeholder="Seu nome completo"
                          type="text"
                          required
                          className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 text-lg px-4 ${errors.fullName ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "hover:border-gray-300"}`}
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          disabled={isLoading}
                        />
                        {errors.fullName && <p className="text-sm text-red-500 flex items-center gap-2 animate-in slide-in-from-top duration-200"><span className="text-red-500">⚠</span>{errors.fullName}</p>}
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="whatsapp" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-md flex items-center justify-center">
                            <Phone className="w-3 h-3 text-white" />
                          </div>
                          WhatsApp
                        </Label>
                        <Input
                          id="whatsapp"
                          type="text"
                          required
                          placeholder="(99) 99999-9999"
                          className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-300 text-lg px-4 ${errors.whatsapp ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "hover:border-gray-300"}`}
                          value={whatsapp}
                          onChange={handlePhoneChange}
                          maxLength={15}
                          disabled={isLoading}
                        />
                        {errors.whatsapp && <p className="text-sm text-red-500 flex items-center gap-2 animate-in slide-in-from-top duration-200"><span className="text-red-500">⚠</span>{errors.whatsapp}</p>}
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                        <Mail className="w-3 h-3 text-white" />
                      </div>
                      E-mail
                    </Label>
                    <Input
                      id="email"
                      placeholder="seu.email@gmail.com"
                      type="email"
                      required
                      autoComplete="email"
                      className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 text-lg px-4 ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "hover:border-gray-300"}`}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                    {errors.email && <p className="text-sm text-red-500 flex items-center gap-2 animate-in slide-in-from-top duration-200"><span className="text-red-500">⚠</span>{errors.email}</p>}
                  </div>

                  {/* Senha */}
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                      Senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="••••••••"
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        className={`h-14 rounded-2xl border-2 border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 pr-14 transition-all duration-300 text-lg px-4 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500/10" : "hover:border-gray-300"}`}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-all duration-300 hover:scale-110"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500 flex items-center gap-2 animate-in slide-in-from-top duration-200"><span className="text-red-500">⚠</span>{errors.password}</p>}

                    {/* Link Esqueci minha senha - só no login */}
                    {isLogin && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-all duration-300 hover:underline hover:scale-105"
                          disabled={isLoading}
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Botão principal */}
                  <Button
                    type="submit"
                    className="w-full h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-3 border-white/30 border-t-white"></div>
                        <span>{isLogin ? "Entrando..." : "Criando conta..."}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>{isLogin ? "Entrar na conta" : "Criar conta grátis"}</span>
                        <span className="text-xl">🚀</span>
                      </div>
                    )}
                  </Button>

                  {/* Divisor */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t-2 border-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-6 text-gray-500 font-medium">ou continue com</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <Button
                    variant="outline"
                    className="w-full h-14 border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg text-lg font-semibold"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    type="button"
                  >
                    <svg className="mr-4 h-6 w-6" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continuar com Google
                  </Button>
                </form>

                {/* Toggle Login/Cadastro */}
                <div className="mt-10 text-center">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100">
                    <p className="text-gray-600 text-lg mb-3">
                      {isLogin ? "Não tem uma conta? " : "Já tem uma conta? "}
                    </p>
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="font-bold text-blue-600 hover:text-blue-500 transition-all duration-300 hover:underline hover:scale-105 text-lg"
                      disabled={isLoading}
                    >
                      {isLogin ? "Criar conta grátis" : "Fazer login"}
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                  <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                    <a href="#" className="hover:text-gray-700 transition-all duration-300 hover:scale-105 font-medium">Termos de Uso</a>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <a href="#" className="hover:text-gray-700 transition-all duration-300 hover:scale-105 font-medium">Privacidade</a>
                    <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                    <a href="#" className="hover:text-gray-700 transition-all duration-300 hover:scale-105 font-medium">Suporte</a>
                  </div>
                  <div className="mt-4 text-xs text-gray-400">
                    &copy; 2024 LeadConsig. Todos os direitos reservados.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
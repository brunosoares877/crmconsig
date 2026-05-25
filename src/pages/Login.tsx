import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone, Zap } from "lucide-react";
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
    <div className="min-h-screen bg-white font-sans selection:bg-blue-100 relative overflow-hidden">
      {/* Premium Aurora Background - Estilo Sales Hero */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[150px] animate-pulse opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-400 rounded-full blur-[150px] animate-pulse delay-700 opacity-20" />
        <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-pink-300 rounded-full blur-[120px] animate-pulse delay-1000 opacity-15" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {/* Container principal com animação de entrada */}
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center animate-in fade-in duration-1000">

          {/* Lado esquerdo - Conteúdo promocional */}
          <div className="hidden lg:flex flex-col justify-center space-y-10 px-8 overflow-visible">
            <div className="space-y-8 overflow-visible">
              {/* Badge de novidade com animação */}
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 border border-blue-200 backdrop-blur-sm shadow-md animate-in slide-in-from-left duration-700 delay-200">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse mr-3"></div>
                <span className="text-blue-800 text-sm font-bold">✨ Sistema Completo de CRM</span>
              </div>

              {/* Título principal com gradiente */}
              <div className="space-y-6 overflow-visible">
                <div className="overflow-visible p-2 -m-2 animate-in slide-in-from-left duration-700 delay-300">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-[1.2] tracking-tight text-gray-900 overflow-visible"
                    style={{ letterSpacing: '-0.02em' }}>
                    Gerencie seus leads com
                    <span className="block bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent mt-2 animate-in slide-in-from-left duration-700 delay-500 pb-2">
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
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl mb-6 shadow-[0_10px_30px_rgba(37,99,235,0.4)]">
                    <Zap className="w-10 h-10 text-white fill-white" />
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
                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(37,99,235,0.5)] disabled:opacity-50 disabled:cursor-not-allowed text-lg border-0"
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
                        <Zap className="w-5 h-5 ml-1" />
                      </div>
                    )}
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
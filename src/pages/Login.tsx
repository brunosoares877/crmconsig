
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn, Key, UserPlus, Building, Phone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { z } from "zod";

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
        SignupSchema.parse({ fullName, company, email, whatsapp, password, confirmPassword });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
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
        await signUp(email, password, company);
        startTrial(); // Start the 7-day trial
        toast.success("Conta criada com sucesso! Seu período de teste de 7 dias começou.");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro ao processar sua solicitação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? "CRM Lead Hub" : "Criar Conta"}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? "Entre com suas credenciais para acessar o sistema" 
              : "Crie sua conta para começar o período de teste gratuito de 7 dias"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
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
                      Criar conta e iniciar teste
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
              className="w-full"
              onClick={() => setIsLogin(!isLogin)}
              disabled={isLoading}
            >
              {isLogin ? "Criar conta" : "Já tem uma conta? Faça login"}
            </Button>
            
            {isLogin && (
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setIsLogin(false)}
                disabled={isLoading}
              >
                Teste Grátis
              </Button>
            )}
          </div>
          
          {isLogin && (
            <p className="text-sm text-muted-foreground text-center">
              Esqueceu a senha? Entre em contato com o administrador
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;

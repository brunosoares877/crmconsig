
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
import { LogIn, Key, UserPlus, Building } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success("Login realizado com sucesso");
      } else {
        if (!company) {
          toast.error("Por favor, informe o nome da sua empresa");
          return;
        }
        await signUp(email, password, company);
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
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
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
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="company">Nome da Empresa</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company"
                    type="text"
                    required
                    placeholder="Sua empresa"
                    className="pl-10"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
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
          <Button
            variant="link"
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading}
          >
            {isLogin ? "Não tem uma conta? Criar agora" : "Já tem uma conta? Faça login"}
          </Button>
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

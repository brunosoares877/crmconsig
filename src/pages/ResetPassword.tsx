import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Lock, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Verificar se há uma sessão válida de reset
  useEffect(() => {
    const checkSession = async () => {
      // Debug: mostrar parâmetros da URL
      console.log('🔍 Verificando parâmetros da URL:', {
        access_token: searchParams.get('access_token') ? 'presente' : 'ausente',
        refresh_token: searchParams.get('refresh_token') ? 'presente' : 'ausente',
        type: searchParams.get('type'),
        fullURL: window.location.href
      });
      
      const { data: { session } } = await supabase.auth.getSession();
      
      // Verificar se há um token de recuperação nos parâmetros da URL
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      console.log('🔐 Tokens encontrados:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        type,
        hasExistingSession: !!session
      });

      if (type === 'recovery' && accessToken) {
        // Definir a sessão com os tokens da URL
        try {
          console.log('🔄 Tentando configurar sessão com tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (error) {
            console.error('❌ Erro ao configurar sessão:', error);
            setIsValidSession(false);
            setMessage({ 
              type: 'error', 
              text: `Link de recuperação inválido ou expirado: ${error.message}. Solicite um novo link.` 
            });
          } else {
            console.log('✅ Sessão configurada com sucesso!');
            setIsValidSession(true);
          }
        } catch (error: any) {
          console.error('❌ Erro ao processar link:', error);
          setIsValidSession(false);
          setMessage({ 
            type: 'error', 
            text: `Erro ao processar link de recuperação: ${error?.message || 'Erro desconhecido'}.` 
          });
        }
      } else if (session) {
        console.log('✅ Sessão válida encontrada');
        setIsValidSession(true);
      } else {
        console.warn('⚠️ Nenhuma sessão válida encontrada');
        setIsValidSession(false);
        
        // Verificar se veio algum hash na URL (alternativa do Supabase)
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          console.log('🔍 Token encontrado no hash, tentando processar...');
          // Tentar processar hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const hashAccessToken = hashParams.get('access_token');
          const hashRefreshToken = hashParams.get('refresh_token');
          
          if (hashAccessToken) {
            try {
              const { error } = await supabase.auth.setSession({
                access_token: hashAccessToken,
                refresh_token: hashRefreshToken || ''
              });
              
              if (!error) {
                console.log('✅ Sessão configurada via hash!');
                setIsValidSession(true);
                return;
              }
            } catch (err) {
              console.error('❌ Erro ao processar hash:', err);
            }
          }
        }
        
        setMessage({ 
          type: 'error', 
          text: 'Acesso não autorizado. Solicite um novo link de recuperação ou verifique se a URL está completa.' 
        });
      }
    };

    checkSession();
  }, [searchParams]);

  // Função para alternar visibilidade da senha
  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Verificar força da senha
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength = Object.values(checks).filter(Boolean).length;

    if (strength <= 2) return { level: 'weak', color: 'red', text: 'Fraca' };
    if (strength <= 3) return { level: 'medium', color: 'yellow', text: 'Média' };
    if (strength <= 4) return { level: 'good', color: 'blue', text: 'Boa' };
    return { level: 'strong', color: 'green', text: 'Forte' };
  };

  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

  // Validações
  const validateForm = () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return false;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return false;
    }

    return true;
  };

  // Redefinir senha
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      // Sucesso
      setMessage({ 
        type: 'success', 
        text: 'Senha redefinida com sucesso! Redirecionando para o login...' 
      });
      
      toast.success('Senha redefinida com sucesso!');

      // Fazer logout e redirecionar para login após 3 segundos
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/login', { replace: true });
      }, 3000);

    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      
      let errorMessage = 'Erro ao redefinir senha. Tente novamente.';
      
      if (error.message?.includes('weak password') || error.message?.includes('password is too weak')) {
        errorMessage = 'A senha é muito fraca. Use uma senha mais forte.';
      } else if (error.message?.includes('session_not_found')) {
        errorMessage = 'Sessão expirada. Solicite um novo link de recuperação.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Ir para login
  const goToLogin = () => {
    navigate('/login');
  };

  // Loading inicial
  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Verificando link de recuperação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sessão inválida
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Link Inválido
            </CardTitle>
            <CardDescription>
              O link de recuperação é inválido ou expirou
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {message && (
              <Alert className="border-red-500">
                <AlertDescription className="text-red-700">
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Para redefinir sua senha, você precisa solicitar um novo link de recuperação.
              </p>
              
              <Button onClick={goToLogin} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ir para o Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formulário de redefinição
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Redefinir Senha
          </CardTitle>
          <CardDescription>
            Digite sua nova senha para finalizar a recuperação
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <form onSubmit={handleResetPassword} className="space-y-4">
            
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  disabled={isLoading}
                  className="pr-12"
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Indicador de força da senha */}
              {newPassword && passwordStrength && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Força da senha:</span>
                    <span className={`font-medium text-${passwordStrength.color}-600`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                      style={{ width: `${(Object.values(getPasswordStrength(newPassword)).filter(Boolean).length - 1) * 25}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Dicas de senha */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>A senha deve conter:</p>
                <div className="grid grid-cols-2 gap-1">
                  <span className={newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                    ✓ 8+ caracteres
                  </span>
                  <span className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    ✓ Maiúscula
                  </span>
                  <span className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    ✓ Minúscula
                  </span>
                  <span className={/\d/.test(newPassword) ? 'text-green-600' : 'text-gray-400'}>
                    ✓ Número
                  </span>
                </div>
              </div>
            </div>

            {/* Confirmar Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar Nova Senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  disabled={isLoading}
                  className="pr-12"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Indicador de confirmação */}
              {confirmPassword && (
                <div className="flex items-center gap-2 text-sm">
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Senhas coincidem</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">Senhas não coincidem</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mensagem de feedback */}
            {message && (
              <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
                <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {/* Botão */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Redefinir Senha
                </>
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <Button 
              variant="ghost" 
              onClick={goToLogin}
              disabled={isLoading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword; 
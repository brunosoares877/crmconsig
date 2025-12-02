import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Shield, CheckCircle, AlertTriangle, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ResetAdminPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Validar token
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidating(false);
        setIsValidToken(false);
        setMessage({ type: 'error', text: 'Token não fornecido.' });
        return;
      }

      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setIsValidating(false);
          setIsValidToken(false);
          setMessage({ type: 'error', text: 'Usuário não autenticado.' });
          return;
        }

        const { data, error } = await supabase
          .from('admin_password_resets')
          .select('*')
          .eq('token', token)
          .eq('user_id', userData.user.id)
          .eq('used', false)
          .single();

        if (error || !data) {
          setIsValidating(false);
          setIsValidToken(false);
          setMessage({ type: 'error', text: 'Token inválido ou expirado.' });
          return;
        }

        // Verificar se o token não expirou
        const expiresAt = new Date(data.expires_at);
        if (expiresAt < new Date()) {
          setIsValidating(false);
          setIsValidToken(false);
          setMessage({ type: 'error', text: 'Token expirado. Solicite um novo.' });
          return;
        }

        setIsValidToken(true);
      } catch (error: any) {
        console.error('Erro ao validar token:', error);
        setIsValidating(false);
        setIsValidToken(false);
        setMessage({ type: 'error', text: 'Erro ao validar token.' });
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  // Hash da senha
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Validar formulário
  const validateForm = () => {
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
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
    
    if (!validateForm() || !token) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não encontrado.');
      }

      const hashedPassword = await hashPassword(newPassword);

      // Atualizar senha administrativa
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ admin_password_hash: hashedPassword })
        .eq('id', userData.user.id);

      if (updateError) throw updateError;

      // Marcar token como usado
      const { error: tokenError } = await supabase
        .from('admin_password_resets')
        .update({ used: true })
        .eq('token', token);

      if (tokenError) {
        console.warn('Erro ao marcar token como usado:', tokenError);
        // Não bloquear se falhar, a senha já foi atualizada
      }

      setMessage({ 
        type: 'success', 
        text: 'Senha administrativa redefinida com sucesso!' 
      });
      
      toast.success('Senha administrativa redefinida com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/settings?tab=security');
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      setMessage({ type: 'error', text: 'Erro ao redefinir senha administrativa. Tente novamente.' });
      toast.error('Erro ao redefinir senha administrativa.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-gray-600">Validando token...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Token Inválido
            </CardTitle>
            <CardDescription>
              O token de redefinição é inválido ou expirou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {message && (
              <Alert className={message.type === 'error' ? 'border-red-500' : 'border-green-500'}>
                <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}
            <Button
              onClick={() => navigate('/settings?tab=security')}
              className="w-full mt-4"
            >
              Voltar para Configurações
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            Redefinir Senha Administrativa
          </CardTitle>
          <CardDescription>
            Digite sua nova senha administrativa
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                Nova Senha Administrativa
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
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
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

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Redefinindo...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Redefinir Senha
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetAdminPassword;


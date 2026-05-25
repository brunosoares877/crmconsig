import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff, Lock, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const PasswordSection: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Função para alternar visibilidade da senha
  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Validações
  const validateForm = () => {
    if (!currentPassword.trim()) {
      setMessage({ type: 'error', text: 'Digite sua senha atual.' });
      return false;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return false;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return false;
    }

    if (currentPassword === newPassword) {
      setMessage({ type: 'error', text: 'A nova senha deve ser diferente da atual.' });
      return false;
    }

    return true;
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

  // Alterar senha
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Primeiro, tentar fazer login com a senha atual para verificar se está correta
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error('Usuário não encontrado.');
      }

      // Tentar fazer signIn com a senha atual para validar
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: currentPassword
      });

      if (signInError) {
        throw new Error('Senha atual incorreta.');
      }

      // Se chegou até aqui, a senha atual está correta, agora atualizar
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw updateError;
      }

      // Sucesso
      setMessage({ 
        type: 'success', 
        text: 'Senha alterada com sucesso!' 
      });
      
      // Limpar formulário
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success('Senha alterada com sucesso!');

    } catch (error: any) {
      console.error('Erro ao alterar senha:', error);
      
      let errorMessage = 'Erro ao alterar senha. Tente novamente.';
      
      if (error.message?.includes('Senha atual incorreta')) {
        errorMessage = 'Senha atual incorreta. Verifique e tente novamente.';
      } else if (error.message?.includes('weak password') || error.message?.includes('password is too weak')) {
        errorMessage = 'A nova senha é muito fraca. Use uma senha mais forte.';
      } else if (error.message?.includes('same password')) {
        errorMessage = 'A nova senha deve ser diferente da atual.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Limpar formulário
  const handleClearForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Alterar Senha
        </CardTitle>
        <CardDescription>
          Mantenha sua conta segura alterando sua senha regularmente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleChangePassword} className="space-y-4">
          
          {/* Senha Atual */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium">
              Senha Atual
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords.current ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                disabled={isLoading}
                className="pr-12"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => togglePasswordVisibility('current')}
              >
                {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Separator className="my-4" />

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

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Alterando...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Alterar Senha
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleClearForm}
              disabled={isLoading}
            >
              Limpar
            </Button>
          </div>
        </form>

        {/* Dicas de segurança */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Dicas de Segurança</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>• Use uma senha única que você não usa em outros sites</p>
            <p>• Combine letras maiúsculas e minúsculas, números e símbolos</p>
            <p>• Evite usar informações pessoais como datas de nascimento</p>
            <p>• Considere usar um gerenciador de senhas</p>
            <p>• Altere sua senha regularmente (a cada 3-6 meses)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
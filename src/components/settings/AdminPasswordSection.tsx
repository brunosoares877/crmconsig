import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Loader2, Eye, EyeOff, Shield, CheckCircle, AlertTriangle, Mail, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const AdminPasswordSection: React.FC = () => {
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    admin: false,
    confirm: false,
    current: false,
    new: false,
    newConfirm: false
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasAdminPassword, setHasAdminPassword] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Verificar se já existe senha administrativa
  useEffect(() => {
    checkAdminPassword();
  }, []);

  const checkAdminPassword = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('admin_password_hash')
        .eq('id', userData.user.id)
        .single();

      if (!error && data?.admin_password_hash) {
        setHasAdminPassword(true);
      }
    } catch (error) {
      console.error('Erro ao verificar senha administrativa:', error);
    }
  };

  // Função para alternar visibilidade da senha
  const togglePasswordVisibility = (field: 'admin' | 'confirm' | 'current' | 'new' | 'newConfirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Hash da senha usando Web Crypto API
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
    if (adminPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha administrativa deve ter pelo menos 6 caracteres.' });
      return false;
    }

    if (adminPassword !== confirmAdminPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return false;
    }

    return true;
  };

  // Configurar senha administrativa
  const handleSetAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não encontrado.');
      }

      const hashedPassword = await hashPassword(adminPassword);

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          admin_password_hash: hashedPassword
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Senha administrativa configurada com sucesso!' 
      });
      
      setAdminPassword('');
      setConfirmAdminPassword('');
      setHasAdminPassword(true);
      toast.success('Senha administrativa configurada com sucesso!');

    } catch (error: any) {
      console.error('Erro ao configurar senha administrativa:', error);
      setMessage({ type: 'error', text: 'Erro ao configurar senha administrativa. Tente novamente.' });
      toast.error('Erro ao configurar senha administrativa.');
    } finally {
      setIsLoading(false);
    }
  };

  // Solicitar redefinição de senha por email
  const handleRequestReset = async () => {
    setIsSendingEmail(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user?.email) {
        throw new Error('Email não encontrado.');
      }

      // Gerar token único para redefinição
      const resetToken = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Válido por 1 hora

      // Salvar token no banco
      const { error: tokenError } = await supabase
        .from('admin_password_resets')
        .upsert({
          user_id: userData.user.id,
          token: resetToken,
          expires_at: expiresAt.toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (tokenError) {
        // Se a tabela não existir, informar ao usuário
        console.error('Erro ao salvar token:', tokenError);
        if (tokenError.code === 'PGRST116' || tokenError.message.includes('does not exist')) {
          toast.error('Tabela de redefinição não encontrada. Execute a migração SQL primeiro.');
          return;
        }
        throw tokenError;
      }

      // Gerar link de redefinição
      const resetLink = `${window.location.origin}/reset-admin-password?token=${resetToken}`;
      
      // TODO: Implementar envio de email real via Supabase Edge Function
      // Por enquanto, copiar link para área de transferência
      try {
        await navigator.clipboard.writeText(resetLink);
        toast.success(
          `Link de redefinição copiado para área de transferência! O link será enviado por email em produção.`,
          { duration: 8000 }
        );
      } catch (err) {
        // Fallback: mostrar o link
        toast.success(
          `Link de redefinição: ${resetLink.substring(0, 50)}... (Em produção, será enviado por email)`,
          { duration: 10000 }
        );
      }

      setShowResetDialog(false);
      
    } catch (error: any) {
      console.error('Erro ao solicitar redefinição:', error);
      toast.error('Erro ao solicitar redefinição. Tente novamente.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Verificar senha atual para ter acesso total
  const handleVerifyCurrentPassword = async () => {
    if (!currentPassword.trim()) {
      setMessage({ type: 'error', text: 'Digite sua senha administrativa atual.' });
      return;
    }

    setIsVerifying(true);
    setMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não encontrado.');
      }

      const hashedPassword = await hashPassword(currentPassword);

      const { data, error } = await supabase
        .from('profiles')
        .select('admin_password_hash')
        .eq('id', userData.user.id)
        .single();

      if (error) throw error;

      if (!data?.admin_password_hash) {
        setMessage({ type: 'error', text: 'Senha administrativa não configurada.' });
        setIsVerifying(false);
        return;
      }

      if (data.admin_password_hash !== hashedPassword) {
        setMessage({ type: 'error', text: 'Senha administrativa incorreta.' });
        setIsVerifying(false);
        return;
      }

      // Senha correta
      setIsVerified(true);
      setMessage({ type: 'success', text: 'Senha verificada com sucesso! Agora você pode alterar ou remover a senha administrativa.' });
      toast.success('Acesso liberado!');
    } catch (error: any) {
      console.error('Erro ao verificar senha:', error);
      setMessage({ type: 'error', text: 'Erro ao verificar senha administrativa. Tente novamente.' });
      toast.error('Erro ao verificar senha administrativa.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Alterar senha administrativa (após verificação)
  const handleChangeAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
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

      const { error } = await supabase
        .from('profiles')
        .update({ admin_password_hash: hashedPassword })
        .eq('id', userData.user.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Senha administrativa alterada com sucesso!' 
      });
      
      setNewPassword('');
      setConfirmNewPassword('');
      setCurrentPassword('');
      setIsVerified(false);
      toast.success('Senha administrativa alterada com sucesso!');

    } catch (error: any) {
      console.error('Erro ao alterar senha administrativa:', error);
      setMessage({ type: 'error', text: 'Erro ao alterar senha administrativa. Tente novamente.' });
      toast.error('Erro ao alterar senha administrativa.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remover senha administrativa (após verificação)
  const handleRemoveAdminPassword = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não encontrado.');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ admin_password_hash: null })
        .eq('id', userData.user.id);

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'Senha administrativa removida com sucesso!' 
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsVerified(false);
      setHasAdminPassword(false);
      toast.success('Senha administrativa removida com sucesso!');

    } catch (error: any) {
      console.error('Erro ao remover senha administrativa:', error);
      setMessage({ type: 'error', text: 'Erro ao remover senha administrativa. Tente novamente.' });
      toast.error('Erro ao remover senha administrativa.');
    }
  };

  // Limpar formulário
  const handleClearForm = () => {
    setAdminPassword('');
    setConfirmAdminPassword('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setMessage(null);
    setIsVerified(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            Senha Administrativa
          </CardTitle>
          <CardDescription>
            Configure uma senha administrativa para confirmar exclusões e ações sensíveis
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {hasAdminPassword ? (
            <div className="space-y-6">
              <Alert className="border-green-500 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Senha administrativa já configurada. Esta senha será solicitada ao excluir itens importantes.
                </AlertDescription>
              </Alert>

              {!isVerified ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-sm font-medium">
                      Digite sua senha administrativa atual para ter acesso total
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          setMessage(null);
                        }}
                        placeholder="Digite sua senha administrativa atual"
                        disabled={isVerifying}
                        className="pr-12"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !isVerifying && currentPassword.trim()) {
                            handleVerifyCurrentPassword();
                          }
                        }}
                        autoFocus
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

                  <Button
                    type="button"
                    onClick={handleVerifyCurrentPassword}
                    disabled={isVerifying || !currentPassword.trim()}
                    className="w-full"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verificar e Ter Acesso Total
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <Alert className="border-blue-500 bg-blue-50">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Acesso liberado! Agora você pode alterar ou remover a senha administrativa.
                    </AlertDescription>
                  </Alert>

                  {/* Formulário para alterar senha */}
                  <form onSubmit={handleChangeAdminPassword} className="space-y-4">
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
                          placeholder="Digite a nova senha administrativa"
                          disabled={isLoading}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword" className="text-sm font-medium">
                        Confirmar Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmNewPassword"
                          type={showPasswords.newConfirm ? "text" : "password"}
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          placeholder="Confirme a nova senha"
                          disabled={isLoading}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                          onClick={() => togglePasswordVisibility('newConfirm')}
                        >
                          {showPasswords.newConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={isLoading || !newPassword || !confirmNewPassword || newPassword !== confirmNewPassword}
                        className="flex-1"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Alterando...
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Alterar Senha
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleRemoveAdminPassword}
                        disabled={isLoading}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Remover Senha
                      </Button>
                    </div>
                  </form>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsVerified(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setMessage(null);
                    }}
                    className="w-full"
                  >
                    Cancelar
                  </Button>
                </div>
              )}

              <Separator />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResetDialog(true)}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Solicitar Redefinição por Email
                </Button>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">Como funciona:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>A senha administrativa será solicitada ao excluir leads, comissões, lembretes e outros itens importantes</li>
                  <li>Digite sua senha atual acima para alterar ou remover a senha administrativa</li>
                  <li>Ou solicite uma redefinição por email se esqueceu a senha</li>
                </ul>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSetAdminPassword} className="space-y-4">
              <Alert className="border-blue-500 bg-blue-50">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  Configure uma senha administrativa para proteger ações de exclusão. Esta senha será solicitada sempre que você tentar excluir itens importantes.
                </AlertDescription>
              </Alert>

              {/* Senha Administrativa */}
              <div className="space-y-2">
                <Label htmlFor="adminPassword" className="text-sm font-medium">
                  Senha Administrativa
                </Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPasswords.admin ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Digite sua senha administrativa"
                    disabled={isLoading}
                    className="pr-12"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => togglePasswordVisibility('admin')}
                  >
                    {showPasswords.admin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha Administrativa */}
              <div className="space-y-2">
                <Label htmlFor="confirmAdminPassword" className="text-sm font-medium">
                  Confirmar Senha Administrativa
                </Label>
                <div className="relative">
                  <Input
                    id="confirmAdminPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={confirmAdminPassword}
                    onChange={(e) => setConfirmAdminPassword(e.target.value)}
                    placeholder="Confirme sua senha administrativa"
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
                {confirmAdminPassword && (
                  <div className="flex items-center gap-2 text-sm">
                    {adminPassword === confirmAdminPassword ? (
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
                  disabled={isLoading || !adminPassword || !confirmAdminPassword || adminPassword !== confirmAdminPassword}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Configurando...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Configurar Senha Administrativa
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
          )}
        </CardContent>
      </Card>

      {/* Dialog de solicitação de redefinição */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Solicitar Redefinição de Senha Administrativa
            </DialogTitle>
            <DialogDescription>
              Um link de redefinição será enviado para seu email cadastrado. O link será válido por 1 hora.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              disabled={isSendingEmail}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRequestReset}
              disabled={isSendingEmail}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};


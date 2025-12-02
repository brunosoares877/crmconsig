import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
}

export const AdminPasswordDialog: React.FC<AdminPasswordDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Confirmar Exclusão",
  description = "Esta ação requer confirmação com senha administrativa",
  itemName
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hash da senha usando Web Crypto API
  const hashPassword = async (password: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  // Verificar senha administrativa
  const handleVerify = async () => {
    if (!password.trim()) {
      setError('Digite a senha administrativa');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('Usuário não autenticado');
      }

      const hashedPassword = await hashPassword(password);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('admin_password_hash')
        .eq('id', userData.user.id)
        .single();

      if (fetchError) {
        throw new Error('Erro ao verificar senha administrativa');
      }

      if (!data?.admin_password_hash) {
        throw new Error('Senha administrativa não configurada. Configure em Configurações > Segurança');
      }

      if (data.admin_password_hash !== hashedPassword) {
        setError('Senha administrativa incorreta');
        setIsVerifying(false);
        return;
      }

      // Senha correta
      toast.success('Senha confirmada com sucesso!');
      setPassword('');
      setError(null);
      onOpenChange(false);
      onConfirm();

    } catch (error: any) {
      console.error('Erro ao verificar senha:', error);
      setError(error.message || 'Erro ao verificar senha administrativa');
      toast.error(error.message || 'Erro ao verificar senha administrativa');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
            {itemName && (
              <span className="block mt-2 font-semibold text-gray-900">
                Item: {itemName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert className="border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700">
              Esta ação é irreversível. Digite sua senha administrativa para confirmar.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="admin-password" className="text-sm font-medium">
              Senha Administrativa
            </Label>
            <div className="relative">
              <Input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Digite sua senha administrativa"
                disabled={isVerifying}
                className="pr-12"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isVerifying && password.trim()) {
                    handleVerify();
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isVerifying}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleVerify}
            disabled={isVerifying || !password.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Confirmar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


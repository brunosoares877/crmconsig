import React, { useState, useRef, useEffect } from 'react';
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
  const allowCloseRef = useRef(false);
  
  // Garantir que o dialog permaneça aberto quando aberto
  useEffect(() => {
    if (open) {
      // Resetar flag imediatamente quando abre
      allowCloseRef.current = false;
      setPassword(''); // Limpar senha quando abre
      setError(null); // Limpar erros quando abre
      
      // Forçar o dialog a permanecer aberto usando requestAnimationFrame
      requestAnimationFrame(() => {
        allowCloseRef.current = false;
      });
    }
  }, [open]);
  
  // Forçar o dialog a permanecer aberto se tentar fechar sem permissão
  useEffect(() => {
    if (open && !allowCloseRef.current) {
      // Monitorar e forçar a permanência aberta
      const checkInterval = setInterval(() => {
        if (open && !allowCloseRef.current) {
          // Se o dialog está aberto mas não deveria fechar, garantir que permanece aberto
          // Isso é uma proteção extra
        }
      }, 100);
      
      return () => clearInterval(checkInterval);
    }
  }, [open]);

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

      const adminPasswordHash = (data as any)?.admin_password_hash;
      
      if (!adminPasswordHash) {
        throw new Error('Senha administrativa não configurada. Configure em Configurações > Segurança');
      }

      if (adminPasswordHash !== hashedPassword) {
        setError('Senha administrativa incorreta');
        setIsVerifying(false);
        return;
      }

      // Senha correta
      toast.success('Senha confirmada com sucesso!');
      setPassword('');
      setError(null);
      allowCloseRef.current = true; // Permitir fechar após confirmar
      // Fechar dialog antes de chamar onConfirm
      onOpenChange(false);
      // Chamar callback de confirmação
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
    allowCloseRef.current = true; // Permitir fechar apenas quando chamado explicitamente
    onOpenChange(false);
  };

  const handleOpenChange = (openValue: boolean) => {
    // BLOQUEAR COMPLETAMENTE qualquer tentativa de fechar automaticamente
    // O dialog só fecha quando allowCloseRef.current for true (via handleClose ou após confirmar)
    if (!openValue) {
      // Verificar se está permitido fechar
      if (!allowCloseRef.current) {
        // IGNORAR completamente - não fazer nada
        // O dialog permanecerá aberto porque o estado 'open' não muda
        // NÃO chamar onOpenChange - isso mantém o dialog aberto
        return;
      }
      // Só fechar se permitido
      allowCloseRef.current = false; // Resetar flag
      onOpenChange(false);
    } else {
      // Quando abrindo, sempre permitir e resetar flag
      allowCloseRef.current = false;
      onOpenChange(true);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent 
        className="sm:max-w-md z-[100]"
        onInteractOutside={(e) => {
          // BLOQUEAR completamente o fechamento ao clicar fora
          if (!allowCloseRef.current) {
            e.preventDefault();
            e.stopPropagation();
            try {
              if ((e as any).nativeEvent?.stopImmediatePropagation) {
                (e as any).nativeEvent.stopImmediatePropagation();
              }
            } catch (err) {
              // Ignorar
            }
          }
        }}
        onPointerDownOutside={(e) => {
          // BLOQUEAR também eventos de pointer
          if (!allowCloseRef.current) {
            e.preventDefault();
            e.stopPropagation();
            try {
              if ((e as any).nativeEvent?.stopImmediatePropagation) {
                (e as any).nativeEvent.stopImmediatePropagation();
              }
            } catch (err) {
              // Ignorar
            }
          }
        }}
        onEscapeKeyDown={(e) => {
          // BLOQUEAR ESC se não estiver permitido fechar
          if (!allowCloseRef.current) {
            e.preventDefault();
            e.stopPropagation();
            try {
              if ((e as any).nativeEvent?.stopImmediatePropagation) {
                (e as any).nativeEvent.stopImmediatePropagation();
              }
            } catch (err) {
              // Ignorar
            }
          }
        }}
        onOpenAutoFocus={(e) => {
          // Prevenir que o foco cause problemas
          e.preventDefault();
        }}
      >
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


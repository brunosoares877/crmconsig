import { supabase } from '@/integrations/supabase/client';

/**
 * Verifica se o usuário tem senha administrativa configurada
 */
export const hasAdminPassword = async (): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('admin_password_hash')
      .eq('id', userData.user.id)
      .single();

    if (error || !data?.admin_password_hash) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao verificar senha administrativa:', error);
    return false;
  }
};

/**
 * Hash da senha usando Web Crypto API
 */
export const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Verifica se a senha administrativa está correta
 */
export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return false;

    const hashedPassword = await hashPassword(password);

    const { data, error } = await supabase
      .from('profiles')
      .select('admin_password_hash')
      .eq('id', userData.user.id)
      .single();

    if (error || !data?.admin_password_hash) {
      return false;
    }

    return data.admin_password_hash === hashedPassword;
  } catch (error) {
    console.error('Erro ao verificar senha administrativa:', error);
    return false;
  }
};


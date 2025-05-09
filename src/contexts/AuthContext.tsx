
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, company: string) => Promise<void>;
  signOut: () => Promise<void>;
  isPrivilegedUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of privileged emails that have full lifetime access
const PRIVILEGED_EMAILS = ['brunosoares877@gmail.com'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPrivilegedUser, setIsPrivilegedUser] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Check if the user is privileged
        if (session?.user?.email) {
          setIsPrivilegedUser(PRIVILEGED_EMAILS.includes(session.user.email));
        } else {
          setIsPrivilegedUser(false);
        }
        
        // Redirect to dashboard on successful login
        if (event === 'SIGNED_IN' && window.location.pathname === '/login') {
          navigate('/dashboard');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Check if the user is privileged
      if (session?.user?.email) {
        setIsPrivilegedUser(PRIVILEGED_EMAILS.includes(session.user.email));
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    navigate('/dashboard');
  };

  const signUp = async (email: string, password: string, company: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: company
        }
      }
    });
    if (error) throw error;
    navigate('/dashboard');
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, isPrivilegedUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

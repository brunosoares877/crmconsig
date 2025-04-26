
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WhiteLabelConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}

interface WhiteLabelContextType {
  config: WhiteLabelConfig;
  updateConfig: (newConfig: Partial<WhiteLabelConfig>) => Promise<void>;
  uploadLogo: (file: File) => Promise<string | null>;
  isLoading: boolean;
}

const defaultConfig: WhiteLabelConfig = {
  primaryColor: '#0078D7',
  secondaryColor: '#00A2ED',
  logoUrl: null,
};

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined);

export const WhiteLabelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Load config from Supabase or localStorage
          const storedConfig = localStorage.getItem(`whiteLabel_${session.user.id}`);
          
          if (storedConfig) {
            setConfig(JSON.parse(storedConfig));
          }
        }
      } catch (error) {
        console.error('Error loading white label config:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadConfig();
  }, []);

  // Apply CSS variables when config changes
  useEffect(() => {
    document.documentElement.style.setProperty('--primary', config.primaryColor);
    document.documentElement.style.setProperty('--secondary', config.secondaryColor);
  }, [config]);

  const updateConfig = async (newConfig: Partial<WhiteLabelConfig>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('User not authenticated');
      }
      
      const updatedConfig = { ...config, ...newConfig };
      
      // Save to localStorage
      localStorage.setItem(`whiteLabel_${session.user.id}`, JSON.stringify(updatedConfig));
      
      setConfig(updatedConfig);
      
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      setIsLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('User not authenticated');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/logo.${fileExt}`;
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from('white-label')
        .upload(fileName, file, { upsert: true });
      
      if (error) {
        throw error;
      }
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('white-label')
        .getPublicUrl(fileName);
      
      const logoUrl = publicUrlData.publicUrl;
      
      // Update config with new logo URL
      await updateConfig({ logoUrl });
      
      return logoUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WhiteLabelContext.Provider value={{ config, updateConfig, uploadLogo, isLoading }}>
      {children}
    </WhiteLabelContext.Provider>
  );
};

export const useWhiteLabel = () => {
  const context = useContext(WhiteLabelContext);
  if (!context) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
  }
  return context;
};

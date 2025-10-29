// Configuração de domínio para links de email
export interface DomainConfig {
  production: string;
  development: string;
}

// Configure aqui seu domínio personalizado
const DOMAIN_CONFIG: DomainConfig = {
  // Coloque aqui seu domínio de produção personalizado
  production: "https://leadconsig.com.br", // ← SEU DOMÍNIO CONFIGURADO
  
  // Desenvolvimento local
  development: "http://localhost:8080"
};

// Detectar ambiente atual
export const getCurrentEnvironment = (): 'production' | 'development' => {
  // Se estiver em localhost ou 127.0.0.1, é desenvolvimento
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
  }
  
  // Se tem NODE_ENV definido, usar ele
  if (typeof process !== 'undefined' && process.env.NODE_ENV) {
    return process.env.NODE_ENV === 'development' ? 'development' : 'production';
  }
  
  // Se está em Lovable.app, é desenvolvimento
  if (typeof window !== 'undefined' && window.location.hostname.includes('lovable.app')) {
    return 'development';
  }
  
  // Default para produção
  return 'production';
};

// Obter URL base correta para o ambiente atual
export const getBaseURL = (): string => {
  const env = getCurrentEnvironment();
  
  // Em desenvolvimento, sempre usar localhost com porta dinâmica
  if (env === 'development') {
    if (typeof window !== 'undefined') {
      // Usar o protocolo, hostname e porta atuais
      return `${window.location.protocol}//${window.location.host}`;
    }
    return DOMAIN_CONFIG.development;
  }
  
  // Em produção, usar domínio configurado ou atual
  if (typeof window !== 'undefined') {
    // Se já estamos no domínio personalizado, usar ele
    const currentURL = `${window.location.protocol}//${window.location.host}`;
    if (!currentURL.includes('lovable.app')) {
      return currentURL;
    }
  }
  
  return DOMAIN_CONFIG.production;
};

// Obter URL completa para reset de senha
export const getResetPasswordURL = (): string => {
  const baseURL = getBaseURL();
  return `${baseURL}/reset-password`;
};

// Verificar se está em domínio personalizado
export const isCustomDomain = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return !hostname.includes('lovable.app') && 
         !hostname.includes('localhost') && 
         !hostname.includes('127.0.0.1');
};

// Obter informações do domínio atual
export const getDomainInfo = () => {
  const env = getCurrentEnvironment();
  const baseURL = getBaseURL();
  const isCustom = isCustomDomain();
  
  return {
    environment: env,
    baseURL,
    isCustomDomain: isCustom,
    resetPasswordURL: getResetPasswordURL(),
    configured: {
      production: DOMAIN_CONFIG.production,
      development: DOMAIN_CONFIG.development
    }
  };
};

// Função para administradores configurarem o domínio
export const updateProductionDomain = (newDomain: string): void => {
  console.warn('⚠️ Para alterar o domínio de produção, edite o arquivo src/utils/domainConfig.ts');
  console.log('📝 Altere a propriedade "production" para:', newDomain);
};

// Debug: Mostrar configuração atual
export const debugDomainConfig = (): void => {
  const info = getDomainInfo();
  console.group('🌐 Configuração de Domínio');
  console.log('Ambiente:', info.environment);
  console.log('URL Base:', info.baseURL);
  console.log('Domínio Personalizado:', info.isCustomDomain ? '✅ Sim' : '❌ Não');
  console.log('URL Reset Password:', info.resetPasswordURL);
  console.log('Configurado para produção:', info.configured.production);
  console.log('Configurado para desenvolvimento:', info.configured.development);
  console.groupEnd();
}; 
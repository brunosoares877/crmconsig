// SEO and Conversion Optimization Utilities for Paid Traffic

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

// Otimização de títulos para conversão
export const generateConversionTitle = (basePage: string, userCount?: number): string => {
  const conversionTitles = {
    'leads': `Gerencie ${userCount ? `${userCount}+` : 'Todos'} seus Leads - CRM Profissional`,
    'dashboard': `Dashboard Completo - Acompanhe suas Vendas em Tempo Real`,
    'reminders': `Nunca Perca um Follow-up - Sistema de Lembretes Inteligente`,
    'commission': `Controle Total de Comissões - Maximize seus Ganhos`,
    'employees': `Gerencie sua Equipe - Performance e Produtividade`,
    'default': `CRM Completo para Vendas - Aumente sua Conversão em ${new Date().getFullYear()}`
  };

  return conversionTitles[basePage as keyof typeof conversionTitles] || conversionTitles.default;
};

// Meta descriptions otimizadas para conversão
export const generateMetaDescription = (page: string, features?: string[]): string => {
  const descriptions = {
    'leads': `Gerencie leads de forma profissional. Acompanhe conversões, organize contatos e aumente suas vendas. ${features?.join(', ') || 'Paginação, filtros avançados, etiquetas personalizadas'}.`,
    'dashboard': `Dashboard completo com métricas em tempo real. Visualize performance, rankings de vendedores e indicadores de conversão. Tome decisões baseadas em dados.`,
    'reminders': `Sistema de lembretes inteligente com prioridades. Nunca perca um follow-up importante. Organize tarefas por cores e categorias.`,
    'commission': `Controle completo de comissões e pagamentos. Acompanhe ganhos por vendedor, aprove comissões e gere relatórios detalhados.`,
    'employees': `Gerencie sua equipe de vendas. Acompanhe performance individual, defina metas e otimize resultados da sua equipe.`,
    'default': `CRM completo para empresas que querem vender mais. Gerencie leads, acompanhe vendas, organize equipe e maximize conversões.`
  };

  return descriptions[page as keyof typeof descriptions] || descriptions.default;
};

// Keywords otimizadas para tráfego pago
export const getOptimizedKeywords = (page: string): string[] => {
  const keywords = {
    'leads': [
      'gerenciamento de leads',
      'crm leads',
      'organizar contatos',
      'sistema de vendas',
      'conversão de leads',
      'funil de vendas',
      'gestão comercial',
      'acompanhar clientes'
    ],
    'dashboard': [
      'dashboard vendas',
      'métricas comerciais',
      'relatórios vendas',
      'indicadores performance',
      'análise vendas',
      'kpi vendas',
      'gestão resultados'
    ],
    'reminders': [
      'lembretes vendas',
      'follow up clientes',
      'agenda comercial',
      'organizar tarefas',
      'sistema lembretes',
      'gestão tempo vendas'
    ],
    'commission': [
      'controle comissões',
      'pagamento vendedores',
      'gestão comissões',
      'relatório comissões',
      'cálculo comissões'
    ],
    'employees': [
      'gestão equipe vendas',
      'performance vendedores',
      'ranking vendas',
      'produtividade vendas',
      'gestão comercial'
    ],
    'default': [
      'crm completo',
      'sistema vendas',
      'gestão comercial',
      'gerenciar leads',
      'crm profissional',
      'software vendas',
      'sistema crm'
    ]
  };

  return keywords[page as keyof typeof keywords] || keywords.default;
};

// Gerar structured data para SEO
export const generateStructuredData = (page: string, data?: any) => {
  const baseStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CRM Profissional",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    }
  };

  if (page === 'leads' && data?.totalLeads) {
    return {
      ...baseStructuredData,
      "description": `Gerencie ${data.totalLeads}+ leads de forma profissional`,
      "featureList": [
        "Paginação otimizada para grandes volumes",
        "Filtros avançados por status e etiquetas",
        "Busca inteligente por nome, telefone e CPF",
        "Organização por etiquetas coloridas"
      ]
    };
  }

  return baseStructuredData;
};

// Otimização de URLs para SEO
export const generateSEOFriendlyURL = (page: string, params?: Record<string, string>): string => {
  const baseUrls = {
    'leads': '/leads',
    'dashboard': '/dashboard',
    'reminders': '/lembretes',
    'commission': '/comissoes',
    'employees': '/equipe'
  };

  let url = baseUrls[page as keyof typeof baseUrls] || '/';

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value);
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
};

// Tracking de conversão para tráfego pago
export const trackConversion = (action: string, value?: number, leadId?: string) => {
  // Google Analytics 4
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      event_category: 'CRM_Action',
      event_label: leadId || 'unknown',
      value: value || 0
    });
  }

  // Facebook Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', action, {
      value: value || 0,
      currency: 'BRL',
      content_ids: leadId ? [leadId] : []
    });
  }

  // Google Ads Conversion
  if (typeof gtag !== 'undefined' && action === 'lead_created') {
    gtag('event', 'conversion', {
      send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
      value: value || 0,
      currency: 'BRL'
    });
  }
};

// Otimização de Core Web Vitals
export const optimizeWebVitals = () => {
  // Preload critical resources
  const preloadCritical = () => {
    const criticalResources = [
      '/src/index.css',
      '/src/components/ui/button.tsx',
      '/src/components/ui/card.tsx'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  };

  // Lazy load non-critical components
  const lazyLoadNonCritical = () => {
    const nonCriticalComponents = document.querySelectorAll('[data-lazy]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          element.style.opacity = '1';
          observer.unobserve(element);
        }
      });
    });

    nonCriticalComponents.forEach(component => {
      observer.observe(component);
    });
  };

  preloadCritical();
  lazyLoadNonCritical();
};

// Landing page optimization para tráfego pago
export const generateLandingPageData = (source: string, campaign?: string) => {
  const landingPages = {
    'google-ads': {
      headline: 'CRM Profissional que Aumenta suas Vendas em 300%',
      subheadline: 'Gerencie leads, acompanhe conversões e nunca perca uma oportunidade',
      cta: 'Comece Grátis Agora',
      benefits: [
        'Paginação otimizada para 1500+ leads',
        'Dashboard com métricas em tempo real',
        'Sistema de lembretes inteligente',
        'Controle completo de comissões'
      ]
    },
    'facebook-ads': {
      headline: 'Pare de Perder Vendas por Desorganização',
      subheadline: 'CRM completo que organiza seus leads e multiplica suas conversões',
      cta: 'Quero Organizar Minhas Vendas',
      benefits: [
        'Nunca mais perca um follow-up',
        'Organize milhares de leads facilmente',
        'Acompanhe performance da equipe',
        'Calcule comissões automaticamente'
      ]
    },
    'default': {
      headline: 'CRM Completo para Vendedores Profissionais',
      subheadline: 'Gerencie leads, equipe e comissões em um só lugar',
      cta: 'Experimente Grátis',
      benefits: [
        'Interface otimizada para alta performance',
        'Suporte para grandes volumes de dados',
        'Relatórios e métricas avançadas',
        'Sistema completo de gestão comercial'
      ]
    }
  };

  const pageData = landingPages[source as keyof typeof landingPages] || landingPages.default;
  
  return {
    ...pageData,
    campaign: campaign || 'organic',
    source,
    timestamp: new Date().toISOString()
  };
};

// Configurações de performance para produção
export const getProductionOptimizations = () => {
  return {
    // Configurações de cache
    cacheSettings: {
      staticAssets: '1y',
      apiResponses: '5m',
      images: '30d'
    },
    
    // Configurações de compressão
    compression: {
      enabled: true,
      level: 6,
      threshold: 1024
    },
    
    // Configurações de CDN
    cdn: {
      enabled: true,
      domains: ['cdn.example.com'],
      regions: ['us-east-1', 'sa-east-1']
    },
    
    // Configurações de monitoramento
    monitoring: {
      errorTracking: true,
      performanceMetrics: true,
      userBehavior: true
    }
  };
}; 
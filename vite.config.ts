import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    
    // Compressão Gzip e Brotli
    mode === 'production' && compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    mode === 'production' && compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    
    // Análise do bundle
    mode === 'production' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    
    mode === 'production' && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'LeadConsig - CRM Inteligente para Crédito Consignado',
        short_name: 'LeadConsig',
        description: 'Sistema CRM completo para gestão de leads e vendas de crédito consignado. Aumente suas conversões e organize seu negócio.',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/([a-zA-Z0-9_-]+\.)*supabase\.co\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /\/lovable-uploads\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'uploads',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          }
        ],
      },
    }),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
  // Otimizações para produção
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: mode !== 'production',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log'] : [],
      },
      mangle: {
        safari10: true,
      },
    },
    rollupOptions: {
      output: {
        // Otimizar nomes de arquivos para cache
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash].[ext]';
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        },
        manualChunks: (id) => {
          // Vendor chunks ultra-otimizados
          if (id.includes('node_modules')) {
            // React core - sempre carregado
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'react-core';
            }
            
            // UI crítico - carregado com app principal
            if (id.includes('@radix-ui/react-dialog') || 
                id.includes('@radix-ui/react-select') ||
                id.includes('@radix-ui/react-tabs')) {
              return 'ui-critical';
            }
            
            // UI não crítico - lazy loading
            if (id.includes('@radix-ui')) {
              return 'ui-lazy';
            }
            
            // Supabase core
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-core';
            }
            
            // Auth e realtime - lazy
            if (id.includes('@supabase/auth') || id.includes('@supabase/realtime')) {
              return 'supabase-features';
            }
            
            // Utilitários críticos
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-critical';
            }
            
            // Date utilities - lazy para páginas que usam
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            
            // Ícones - lazy loading por seção
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            
            // Sentry - só em produção
            if (id.includes('@sentry')) {
              return 'monitoring';
            }
            
            // Charts e visualizações - muito específico
            if (id.includes('recharts') || id.includes('chart')) {
              return 'charts';
            }
            
            // Formulários - lazy para páginas com forms
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms';
            }
            
            // Resto dos vendors
            return 'vendor-misc';
          }
          
          // Chunks por páginas com agrupamento inteligente
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0].toLowerCase();
            
            // Agrupar páginas relacionadas
            if (['leads', 'leadnew', 'leadimport', 'leadstrash'].includes(pageName)) {
              return 'pages-leads';
            }
            if (['commission', 'commissionsettings'].includes(pageName)) {
              return 'pages-commission';
            }
            if (['reminders', 'reminderscalendar', 'portability'].includes(pageName)) {
              return 'pages-scheduling';
            }
            if (['settings', 'employees', 'plans'].includes(pageName)) {
              return 'pages-admin';
            }
            
            return `page-${pageName}`;
          }
          
          // Agrupar componentes por funcionalidade
          if (id.includes('/components/')) {
            if (id.includes('/ui/')) {
              return 'components-ui';
            }
            if (id.includes('/dashboard/')) {
              return 'components-dashboard';
            }
            if (id.includes('/forms/')) {
              return 'components-forms';
            }
            if (id.includes('/commission/')) {
              return 'components-commission';
            }
          }
        },
      },
    },
    // Otimizar tamanho dos chunks
    chunkSizeWarningLimit: 1000,
    // Habilitar tree-shaking agressivo
    modulePreload: {
      polyfill: true,
      resolveDependencies: (url, deps) => {
        // Preload crítico baseado na página
        if (url.includes('pages-leads')) {
          return deps.filter(dep => 
            dep.includes('supabase-core') || 
            dep.includes('ui-critical') ||
            dep.includes('date-utils')
          );
        }
        if (url.includes('pages-commission')) {
          return deps.filter(dep => 
            dep.includes('supabase-core') || 
            dep.includes('charts')
          );
        }
        return [];
      }
    },
    
    // Configurações avançadas de otimização
    reportCompressedSize: false, // Acelera build
    write: true,
    emptyOutDir: true,
  },
  
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@supabase/supabase-js',
      'date-fns',
      'lucide-react'
    ],
  },
  
  // Configurações para SEO e performance
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __IS_PRODUCTION__: mode === 'production',
  },
  
  // CSS otimizations
  css: {
    devSourcemap: mode !== 'production',
  },
}));


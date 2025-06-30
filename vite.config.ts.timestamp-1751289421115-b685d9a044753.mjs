// vite.config.ts
import { defineConfig } from "file:///C:/Users/Bruno/Desktop/Leadconsig/crmconsig/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Bruno/Desktop/Leadconsig/crmconsig/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { VitePWA } from "file:///C:/Users/Bruno/Desktop/Leadconsig/crmconsig/node_modules/vite-plugin-pwa/dist/index.js";
import compression from "file:///C:/Users/Bruno/Desktop/Leadconsig/crmconsig/node_modules/vite-plugin-compression/dist/index.mjs";
import { visualizer } from "file:///C:/Users/Bruno/Desktop/Leadconsig/crmconsig/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Bruno\\Desktop\\Leadconsig\\crmconsig";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    // Compressão Gzip e Brotli
    mode === "production" && compression({
      algorithm: "gzip",
      ext: ".gz"
    }),
    mode === "production" && compression({
      algorithm: "brotliCompress",
      ext: ".br"
    }),
    // Análise do bundle
    mode === "production" && visualizer({
      filename: "dist/bundle-analysis.html",
      open: false,
      gzipSize: true,
      brotliSize: true
    }),
    mode === "production" && VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "LeadConsig - CRM Inteligente para Cr\xE9dito Consignado",
        short_name: "LeadConsig",
        description: "Sistema CRM completo para gest\xE3o de leads e vendas de cr\xE9dito consignado. Aumente suas convers\xF5es e organize seu neg\xF3cio.",
        theme_color: "#1e40af",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/favicon.ico",
            sizes: "64x64 32x32 24x24 16x16",
            type: "image/x-icon"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // 5MB
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/([a-zA-Z0-9_-]+\.)*supabase\.co\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 },
              networkTimeoutSeconds: 10
            }
          },
          {
            urlPattern: /\/lovable-uploads\//,
            handler: "CacheFirst",
            options: {
              cacheName: "uploads",
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  // Otimizações para produção
  build: {
    rollupOptions: {
      input: mode === "test" ? "./src/main.simple.tsx" : "./src/main.tsx"
    },
    target: "es2015",
    minify: "terser",
    sourcemap: mode !== "production",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
        pure_funcs: mode === "production" ? ["console.log"] : []
      },
      mangle: {
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        // Otimizar nomes de arquivos para cache
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return "assets/[name]-[hash].[ext]";
          const info = assetInfo.name.split(".");
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
          if (id.includes("node_modules")) {
            if (id.includes("react/") || id.includes("react-dom/")) {
              return "react-core";
            }
            if (id.includes("@radix-ui/react-dialog") || id.includes("@radix-ui/react-select") || id.includes("@radix-ui/react-tabs")) {
              return "ui-critical";
            }
            if (id.includes("@radix-ui")) {
              return "ui-lazy";
            }
            if (id.includes("@supabase/supabase-js")) {
              return "supabase-core";
            }
            if (id.includes("@supabase/auth") || id.includes("@supabase/realtime")) {
              return "supabase-features";
            }
            if (id.includes("clsx") || id.includes("tailwind-merge")) {
              return "utils-critical";
            }
            if (id.includes("date-fns")) {
              return "date-utils";
            }
            if (id.includes("lucide-react")) {
              return "icons";
            }
            if (id.includes("@sentry")) {
              return "monitoring";
            }
            if (id.includes("recharts") || id.includes("chart")) {
              return "charts";
            }
            if (id.includes("react-hook-form") || id.includes("zod")) {
              return "forms";
            }
            return "vendor-misc";
          }
          if (id.includes("/pages/")) {
            const pageName = id.split("/pages/")[1].split(".")[0].toLowerCase();
            if (["leads", "leadnew", "leadimport", "leadstrash"].includes(pageName)) {
              return "pages-leads";
            }
            if (["commission", "commissionsettings"].includes(pageName)) {
              return "pages-commission";
            }
            if (["reminders", "reminderscalendar", "portability"].includes(pageName)) {
              return "pages-scheduling";
            }
            if (["settings", "employees", "plans"].includes(pageName)) {
              return "pages-admin";
            }
            return `page-${pageName}`;
          }
          if (id.includes("/components/")) {
            if (id.includes("/ui/")) {
              return "components-ui";
            }
            if (id.includes("/dashboard/")) {
              return "components-dashboard";
            }
            if (id.includes("/forms/")) {
              return "components-forms";
            }
            if (id.includes("/commission/")) {
              return "components-commission";
            }
          }
        }
      }
    },
    // Otimizar tamanho dos chunks
    chunkSizeWarningLimit: 1e3,
    // Habilitar tree-shaking agressivo
    modulePreload: {
      polyfill: true,
      resolveDependencies: (url, deps) => {
        if (url.includes("pages-leads")) {
          return deps.filter(
            (dep) => dep.includes("supabase-core") || dep.includes("ui-critical") || dep.includes("date-utils")
          );
        }
        if (url.includes("pages-commission")) {
          return deps.filter(
            (dep) => dep.includes("supabase-core") || dep.includes("charts")
          );
        }
        return [];
      }
    },
    // Configurações avançadas de otimização
    reportCompressedSize: false,
    // Acelera build
    write: true,
    emptyOutDir: true
  },
  // Otimizações de desenvolvimento
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@supabase/supabase-js",
      "date-fns",
      "lucide-react"
    ]
  },
  // Configurações para SEO e performance
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || "1.0.0"),
    __BUILD_TIME__: JSON.stringify((/* @__PURE__ */ new Date()).toISOString()),
    __IS_PRODUCTION__: mode === "production"
  },
  // CSS otimizations
  css: {
    devSourcemap: mode !== "production"
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxCcnVub1xcXFxEZXNrdG9wXFxcXExlYWRjb25zaWdcXFxcY3JtY29uc2lnXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxCcnVub1xcXFxEZXNrdG9wXFxcXExlYWRjb25zaWdcXFxcY3JtY29uc2lnXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9CcnVuby9EZXNrdG9wL0xlYWRjb25zaWcvY3JtY29uc2lnL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcclxuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcclxuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbic7XHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgXHJcbiAgICAvLyBDb21wcmVzc1x1MDBFM28gR3ppcCBlIEJyb3RsaVxyXG4gICAgbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nICYmIGNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgIGV4dDogJy5neicsXHJcbiAgICB9KSxcclxuICAgIG1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiBjb21wcmVzc2lvbih7XHJcbiAgICAgIGFsZ29yaXRobTogJ2Jyb3RsaUNvbXByZXNzJyxcclxuICAgICAgZXh0OiAnLmJyJyxcclxuICAgIH0pLFxyXG4gICAgXHJcbiAgICAvLyBBblx1MDBFMWxpc2UgZG8gYnVuZGxlXHJcbiAgICBtb2RlID09PSAncHJvZHVjdGlvbicgJiYgdmlzdWFsaXplcih7XHJcbiAgICAgIGZpbGVuYW1lOiAnZGlzdC9idW5kbGUtYW5hbHlzaXMuaHRtbCcsXHJcbiAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgXHJcbiAgICBtb2RlID09PSAncHJvZHVjdGlvbicgJiYgVml0ZVBXQSh7XHJcbiAgICAgIHJlZ2lzdGVyVHlwZTogJ2F1dG9VcGRhdGUnLFxyXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbJ2Zhdmljb24uaWNvJywgJ2FwcGxlLXRvdWNoLWljb24ucG5nJywgJ21hc2tlZC1pY29uLnN2ZyddLFxyXG4gICAgICBtYW5pZmVzdDoge1xyXG4gICAgICAgIG5hbWU6ICdMZWFkQ29uc2lnIC0gQ1JNIEludGVsaWdlbnRlIHBhcmEgQ3JcdTAwRTlkaXRvIENvbnNpZ25hZG8nLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdMZWFkQ29uc2lnJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1Npc3RlbWEgQ1JNIGNvbXBsZXRvIHBhcmEgZ2VzdFx1MDBFM28gZGUgbGVhZHMgZSB2ZW5kYXMgZGUgY3JcdTAwRTlkaXRvIGNvbnNpZ25hZG8uIEF1bWVudGUgc3VhcyBjb252ZXJzXHUwMEY1ZXMgZSBvcmdhbml6ZSBzZXUgbmVnXHUwMEYzY2lvLicsXHJcbiAgICAgICAgdGhlbWVfY29sb3I6ICcjMWU0MGFmJyxcclxuICAgICAgICBiYWNrZ3JvdW5kX2NvbG9yOiAnI2ZmZmZmZicsXHJcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxyXG4gICAgICAgIHNjb3BlOiAnLycsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgc3JjOiAnL2Zhdmljb24uaWNvJyxcclxuICAgICAgICAgICAgc2l6ZXM6ICc2NHg2NCAzMngzMiAyNHgyNCAxNngxNicsXHJcbiAgICAgICAgICAgIHR5cGU6ICdpbWFnZS94LWljb24nXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgICB9LFxyXG4gICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLHBuZyxzdmcsaWNvLHdvZmYyfSddLFxyXG4gICAgICAgIG1heGltdW1GaWxlU2l6ZVRvQ2FjaGVJbkJ5dGVzOiA1ICogMTAyNCAqIDEwMjQsIC8vIDVNQlxyXG4gICAgICAgIHNraXBXYWl0aW5nOiB0cnVlLFxyXG4gICAgICAgIGNsaWVudHNDbGFpbTogdHJ1ZSxcclxuICAgICAgICBjbGVhbnVwT3V0ZGF0ZWRDYWNoZXM6IHRydWUsXHJcbiAgICAgICAgcnVudGltZUNhY2hpbmc6IFtcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL15odHRwczpcXC9cXC8oW2EtekEtWjAtOV8tXStcXC4pKnN1cGFiYXNlXFwuY29cXC8vLFxyXG4gICAgICAgICAgICBoYW5kbGVyOiAnTmV0d29ya0ZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ3N1cGFiYXNlLWFwaScsXHJcbiAgICAgICAgICAgICAgZXhwaXJhdGlvbjogeyBtYXhFbnRyaWVzOiAxMDAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgfSxcclxuICAgICAgICAgICAgICBuZXR3b3JrVGltZW91dFNlY29uZHM6IDEwLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgdXJsUGF0dGVybjogL1xcL2xvdmFibGUtdXBsb2Fkc1xcLy8sXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdDYWNoZUZpcnN0JyxcclxuICAgICAgICAgICAgb3B0aW9uczoge1xyXG4gICAgICAgICAgICAgIGNhY2hlTmFtZTogJ3VwbG9hZHMnLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogNTAsIG1heEFnZVNlY29uZHM6IDYwICogNjAgKiAyNCAqIDMwIH0sXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXFwuKD86cG5nfGpwZ3xqcGVnfHN2Z3xnaWZ8d2VicCkkLyxcclxuICAgICAgICAgICAgaGFuZGxlcjogJ0NhY2hlRmlyc3QnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAnaW1hZ2VzJyxcclxuICAgICAgICAgICAgICBleHBpcmF0aW9uOiB7IG1heEVudHJpZXM6IDEwMCwgbWF4QWdlU2Vjb25kczogNjAgKiA2MCAqIDI0ICogMzAgfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH1cclxuICAgICAgICBdLFxyXG4gICAgICB9LFxyXG4gICAgfSksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgXHJcbiAgLy8gT3RpbWl6YVx1MDBFN1x1MDBGNWVzIHBhcmEgcHJvZHVcdTAwRTdcdTAwRTNvXHJcbiAgYnVpbGQ6IHtcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgaW5wdXQ6IG1vZGUgPT09ICd0ZXN0JyA/ICcuL3NyYy9tYWluLnNpbXBsZS50c3gnIDogJy4vc3JjL21haW4udHN4JyxcclxuICAgIH0sXHJcbiAgICB0YXJnZXQ6ICdlczIwMTUnLFxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHNvdXJjZW1hcDogbW9kZSAhPT0gJ3Byb2R1Y3Rpb24nLFxyXG4gICAgdGVyc2VyT3B0aW9uczoge1xyXG4gICAgICBjb21wcmVzczoge1xyXG4gICAgICAgIGRyb3BfY29uc29sZTogbW9kZSA9PT0gJ3Byb2R1Y3Rpb24nLFxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IG1vZGUgPT09ICdwcm9kdWN0aW9uJyxcclxuICAgICAgICBwdXJlX2Z1bmNzOiBtb2RlID09PSAncHJvZHVjdGlvbicgPyBbJ2NvbnNvbGUubG9nJ10gOiBbXSxcclxuICAgICAgfSxcclxuICAgICAgbWFuZ2xlOiB7XHJcbiAgICAgICAgc2FmYXJpMTA6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAvLyBPdGltaXphciBub21lcyBkZSBhcnF1aXZvcyBwYXJhIGNhY2hlXHJcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdhc3NldHMvW25hbWVdLVtoYXNoXS5qcycsXHJcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6IChhc3NldEluZm8pID0+IHtcclxuICAgICAgICAgIGlmICghYXNzZXRJbmZvLm5hbWUpIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nO1xyXG4gICAgICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lLnNwbGl0KCcuJyk7XHJcbiAgICAgICAgICBjb25zdCBleHRUeXBlID0gaW5mb1tpbmZvLmxlbmd0aCAtIDFdO1xyXG4gICAgICAgICAgaWYgKC9cXC4ocG5nfGpwZT9nfGdpZnxzdmd8d2VicHxpY28pJC9pLnRlc3QoYXNzZXRJbmZvLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBgYXNzZXRzL2ltYWdlcy9bbmFtZV0tW2hhc2hdLiR7ZXh0VHlwZX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKC9cXC4od29mZjI/fGVvdHx0dGZ8b3RmKSQvaS50ZXN0KGFzc2V0SW5mby5uYW1lKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gYGFzc2V0cy9mb250cy9bbmFtZV0tW2hhc2hdLiR7ZXh0VHlwZX1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGBhc3NldHMvW25hbWVdLVtoYXNoXS4ke2V4dFR5cGV9YDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1hbnVhbENodW5rczogKGlkKSA9PiB7XHJcbiAgICAgICAgICAvLyBWZW5kb3IgY2h1bmtzIHVsdHJhLW90aW1pemFkb3NcclxuICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgLy8gUmVhY3QgY29yZSAtIHNlbXByZSBjYXJyZWdhZG9cclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdyZWFjdC8nKSB8fCBpZC5pbmNsdWRlcygncmVhY3QtZG9tLycpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdyZWFjdC1jb3JlJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVUkgY3JcdTAwRUR0aWNvIC0gY2FycmVnYWRvIGNvbSBhcHAgcHJpbmNpcGFsXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHJhZGl4LXVpL3JlYWN0LWRpYWxvZycpIHx8IFxyXG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ0ByYWRpeC11aS9yZWFjdC1zZWxlY3QnKSB8fFxyXG4gICAgICAgICAgICAgICAgaWQuaW5jbHVkZXMoJ0ByYWRpeC11aS9yZWFjdC10YWJzJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3VpLWNyaXRpY2FsJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVUkgblx1MDBFM28gY3JcdTAwRUR0aWNvIC0gbGF6eSBsb2FkaW5nXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHJhZGl4LXVpJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3VpLWxhenknO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBTdXBhYmFzZSBjb3JlXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3N1cGFiYXNlLWNvcmUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBBdXRoIGUgcmVhbHRpbWUgLSBsYXp5XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnQHN1cGFiYXNlL2F1dGgnKSB8fCBpZC5pbmNsdWRlcygnQHN1cGFiYXNlL3JlYWx0aW1lJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3N1cGFiYXNlLWZlYXR1cmVzJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gVXRpbGl0XHUwMEUxcmlvcyBjclx1MDBFRHRpY29zXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnY2xzeCcpIHx8IGlkLmluY2x1ZGVzKCd0YWlsd2luZC1tZXJnZScpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICd1dGlscy1jcml0aWNhbCc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIERhdGUgdXRpbGl0aWVzIC0gbGF6eSBwYXJhIHBcdTAwRTFnaW5hcyBxdWUgdXNhbVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2RhdGUtZm5zJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2RhdGUtdXRpbHMnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBcdTAwQ0Rjb25lcyAtIGxhenkgbG9hZGluZyBwb3Igc2VcdTAwRTdcdTAwRTNvXHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnbHVjaWRlLXJlYWN0JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2ljb25zJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gU2VudHJ5IC0gc1x1MDBGMyBlbSBwcm9kdVx1MDBFN1x1MDBFM29cclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdAc2VudHJ5JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ21vbml0b3JpbmcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBDaGFydHMgZSB2aXN1YWxpemFcdTAwRTdcdTAwRjVlcyAtIG11aXRvIGVzcGVjXHUwMEVEZmljb1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlY2hhcnRzJykgfHwgaWQuaW5jbHVkZXMoJ2NoYXJ0JykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2NoYXJ0cyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIC8vIEZvcm11bFx1MDBFMXJpb3MgLSBsYXp5IHBhcmEgcFx1MDBFMWdpbmFzIGNvbSBmb3Jtc1xyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ3JlYWN0LWhvb2stZm9ybScpIHx8IGlkLmluY2x1ZGVzKCd6b2QnKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAnZm9ybXMnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAvLyBSZXN0byBkb3MgdmVuZG9yc1xyXG4gICAgICAgICAgICByZXR1cm4gJ3ZlbmRvci1taXNjJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIFxyXG4gICAgICAgICAgLy8gQ2h1bmtzIHBvciBwXHUwMEUxZ2luYXMgY29tIGFncnVwYW1lbnRvIGludGVsaWdlbnRlXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9wYWdlcy8nKSkge1xyXG4gICAgICAgICAgICBjb25zdCBwYWdlTmFtZSA9IGlkLnNwbGl0KCcvcGFnZXMvJylbMV0uc3BsaXQoJy4nKVswXS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICBcclxuICAgICAgICAgICAgLy8gQWdydXBhciBwXHUwMEUxZ2luYXMgcmVsYWNpb25hZGFzXHJcbiAgICAgICAgICAgIGlmIChbJ2xlYWRzJywgJ2xlYWRuZXcnLCAnbGVhZGltcG9ydCcsICdsZWFkc3RyYXNoJ10uaW5jbHVkZXMocGFnZU5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdwYWdlcy1sZWFkcyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKFsnY29tbWlzc2lvbicsICdjb21taXNzaW9uc2V0dGluZ3MnXS5pbmNsdWRlcyhwYWdlTmFtZSkpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ3BhZ2VzLWNvbW1pc3Npb24nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChbJ3JlbWluZGVycycsICdyZW1pbmRlcnNjYWxlbmRhcicsICdwb3J0YWJpbGl0eSddLmluY2x1ZGVzKHBhZ2VOYW1lKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAncGFnZXMtc2NoZWR1bGluZyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKFsnc2V0dGluZ3MnLCAnZW1wbG95ZWVzJywgJ3BsYW5zJ10uaW5jbHVkZXMocGFnZU5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdwYWdlcy1hZG1pbic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIHJldHVybiBgcGFnZS0ke3BhZ2VOYW1lfWA7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIC8vIEFncnVwYXIgY29tcG9uZW50ZXMgcG9yIGZ1bmNpb25hbGlkYWRlXHJcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9jb21wb25lbnRzLycpKSB7XHJcbiAgICAgICAgICAgIGlmIChpZC5pbmNsdWRlcygnL3VpLycpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICdjb21wb25lbnRzLXVpJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9kYXNoYm9hcmQvJykpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJ2NvbXBvbmVudHMtZGFzaGJvYXJkJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJy9mb3Jtcy8nKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAnY29tcG9uZW50cy1mb3Jtcyc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCcvY29tbWlzc2lvbi8nKSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiAnY29tcG9uZW50cy1jb21taXNzaW9uJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gT3RpbWl6YXIgdGFtYW5obyBkb3MgY2h1bmtzXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXHJcbiAgICAvLyBIYWJpbGl0YXIgdHJlZS1zaGFraW5nIGFncmVzc2l2b1xyXG4gICAgbW9kdWxlUHJlbG9hZDoge1xyXG4gICAgICBwb2x5ZmlsbDogdHJ1ZSxcclxuICAgICAgcmVzb2x2ZURlcGVuZGVuY2llczogKHVybCwgZGVwcykgPT4ge1xyXG4gICAgICAgIC8vIFByZWxvYWQgY3JcdTAwRUR0aWNvIGJhc2VhZG8gbmEgcFx1MDBFMWdpbmFcclxuICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCdwYWdlcy1sZWFkcycpKSB7XHJcbiAgICAgICAgICByZXR1cm4gZGVwcy5maWx0ZXIoZGVwID0+IFxyXG4gICAgICAgICAgICBkZXAuaW5jbHVkZXMoJ3N1cGFiYXNlLWNvcmUnKSB8fCBcclxuICAgICAgICAgICAgZGVwLmluY2x1ZGVzKCd1aS1jcml0aWNhbCcpIHx8XHJcbiAgICAgICAgICAgIGRlcC5pbmNsdWRlcygnZGF0ZS11dGlscycpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCdwYWdlcy1jb21taXNzaW9uJykpIHtcclxuICAgICAgICAgIHJldHVybiBkZXBzLmZpbHRlcihkZXAgPT4gXHJcbiAgICAgICAgICAgIGRlcC5pbmNsdWRlcygnc3VwYWJhc2UtY29yZScpIHx8IFxyXG4gICAgICAgICAgICBkZXAuaW5jbHVkZXMoJ2NoYXJ0cycpXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gW107XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcclxuICAgIC8vIENvbmZpZ3VyYVx1MDBFN1x1MDBGNWVzIGF2YW5cdTAwRTdhZGFzIGRlIG90aW1pemFcdTAwRTdcdTAwRTNvXHJcbiAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogZmFsc2UsIC8vIEFjZWxlcmEgYnVpbGRcclxuICAgIHdyaXRlOiB0cnVlLFxyXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXHJcbiAgfSxcclxuICBcclxuICAvLyBPdGltaXphXHUwMEU3XHUwMEY1ZXMgZGUgZGVzZW52b2x2aW1lbnRvXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgICdyZWFjdCcsXHJcbiAgICAgICdyZWFjdC1kb20nLFxyXG4gICAgICAnQHN1cGFiYXNlL3N1cGFiYXNlLWpzJyxcclxuICAgICAgJ2RhdGUtZm5zJyxcclxuICAgICAgJ2x1Y2lkZS1yZWFjdCdcclxuICAgIF0sXHJcbiAgfSxcclxuICBcclxuICAvLyBDb25maWd1cmFcdTAwRTdcdTAwRjVlcyBwYXJhIFNFTyBlIHBlcmZvcm1hbmNlXHJcbiAgZGVmaW5lOiB7XHJcbiAgICBfX0FQUF9WRVJTSU9OX186IEpTT04uc3RyaW5naWZ5KHByb2Nlc3MuZW52Lm5wbV9wYWNrYWdlX3ZlcnNpb24gfHwgJzEuMC4wJyksXHJcbiAgICBfX0JVSUxEX1RJTUVfXzogSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKS50b0lTT1N0cmluZygpKSxcclxuICAgIF9fSVNfUFJPRFVDVElPTl9fOiBtb2RlID09PSAncHJvZHVjdGlvbicsXHJcbiAgfSxcclxuICBcclxuICAvLyBDU1Mgb3RpbWl6YXRpb25zXHJcbiAgY3NzOiB7XHJcbiAgICBkZXZTb3VyY2VtYXA6IG1vZGUgIT09ICdwcm9kdWN0aW9uJyxcclxuICB9LFxyXG59KSk7XHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStULFNBQVMsb0JBQW9CO0FBQzVWLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyxlQUFlO0FBQ3hCLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsa0JBQWtCO0FBTDNCLElBQU0sbUNBQW1DO0FBUXpDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQTtBQUFBLElBR04sU0FBUyxnQkFBZ0IsWUFBWTtBQUFBLE1BQ25DLFdBQVc7QUFBQSxNQUNYLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFBQSxJQUNELFNBQVMsZ0JBQWdCLFlBQVk7QUFBQSxNQUNuQyxXQUFXO0FBQUEsTUFDWCxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUE7QUFBQSxJQUdELFNBQVMsZ0JBQWdCLFdBQVc7QUFBQSxNQUNsQyxVQUFVO0FBQUEsTUFDVixNQUFNO0FBQUEsTUFDTixVQUFVO0FBQUEsTUFDVixZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQUEsSUFFRCxTQUFTLGdCQUFnQixRQUFRO0FBQUEsTUFDL0IsY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsd0JBQXdCLGlCQUFpQjtBQUFBLE1BQ3hFLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxRQUNQLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsc0NBQXNDO0FBQUEsUUFDckQsK0JBQStCLElBQUksT0FBTztBQUFBO0FBQUEsUUFDMUMsYUFBYTtBQUFBLFFBQ2IsY0FBYztBQUFBLFFBQ2QsdUJBQXVCO0FBQUEsUUFDdkIsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWSxFQUFFLFlBQVksS0FBSyxlQUFlLEtBQUssR0FBRztBQUFBLGNBQ3RELHVCQUF1QjtBQUFBLFlBQ3pCO0FBQUEsVUFDRjtBQUFBLFVBQ0E7QUFBQSxZQUNFLFlBQVk7QUFBQSxZQUNaLFNBQVM7QUFBQSxZQUNULFNBQVM7QUFBQSxjQUNQLFdBQVc7QUFBQSxjQUNYLFlBQVksRUFBRSxZQUFZLElBQUksZUFBZSxLQUFLLEtBQUssS0FBSyxHQUFHO0FBQUEsWUFDakU7QUFBQSxVQUNGO0FBQUEsVUFDQTtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsWUFBWSxFQUFFLFlBQVksS0FBSyxlQUFlLEtBQUssS0FBSyxLQUFLLEdBQUc7QUFBQSxZQUNsRTtBQUFBLFVBQ0Y7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0gsRUFBRSxPQUFPLE9BQU87QUFBQSxFQUVoQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDdEM7QUFBQSxFQUNGO0FBQUE7QUFBQSxFQUdBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLE9BQU8sU0FBUyxTQUFTLDBCQUEwQjtBQUFBLElBQ3JEO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixRQUFRO0FBQUEsSUFDUixXQUFXLFNBQVM7QUFBQSxJQUNwQixlQUFlO0FBQUEsTUFDYixVQUFVO0FBQUEsUUFDUixjQUFjLFNBQVM7QUFBQSxRQUN2QixlQUFlLFNBQVM7QUFBQSxRQUN4QixZQUFZLFNBQVMsZUFBZSxDQUFDLGFBQWEsSUFBSSxDQUFDO0FBQUEsTUFDekQ7QUFBQSxNQUNBLFFBQVE7QUFBQSxRQUNOLFVBQVU7QUFBQSxNQUNaO0FBQUEsSUFDRjtBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBO0FBQUEsUUFFTixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0I7QUFBQSxRQUNoQixnQkFBZ0IsQ0FBQyxjQUFjO0FBQzdCLGNBQUksQ0FBQyxVQUFVLEtBQU0sUUFBTztBQUM1QixnQkFBTSxPQUFPLFVBQVUsS0FBSyxNQUFNLEdBQUc7QUFDckMsZ0JBQU0sVUFBVSxLQUFLLEtBQUssU0FBUyxDQUFDO0FBQ3BDLGNBQUksbUNBQW1DLEtBQUssVUFBVSxJQUFJLEdBQUc7QUFDM0QsbUJBQU8sK0JBQStCLE9BQU87QUFBQSxVQUMvQztBQUNBLGNBQUksMkJBQTJCLEtBQUssVUFBVSxJQUFJLEdBQUc7QUFDbkQsbUJBQU8sOEJBQThCLE9BQU87QUFBQSxVQUM5QztBQUNBLGlCQUFPLHdCQUF3QixPQUFPO0FBQUEsUUFDeEM7QUFBQSxRQUNBLGNBQWMsQ0FBQyxPQUFPO0FBRXBCLGNBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUUvQixnQkFBSSxHQUFHLFNBQVMsUUFBUSxLQUFLLEdBQUcsU0FBUyxZQUFZLEdBQUc7QUFDdEQscUJBQU87QUFBQSxZQUNUO0FBR0EsZ0JBQUksR0FBRyxTQUFTLHdCQUF3QixLQUNwQyxHQUFHLFNBQVMsd0JBQXdCLEtBQ3BDLEdBQUcsU0FBUyxzQkFBc0IsR0FBRztBQUN2QyxxQkFBTztBQUFBLFlBQ1Q7QUFHQSxnQkFBSSxHQUFHLFNBQVMsV0FBVyxHQUFHO0FBQzVCLHFCQUFPO0FBQUEsWUFDVDtBQUdBLGdCQUFJLEdBQUcsU0FBUyx1QkFBdUIsR0FBRztBQUN4QyxxQkFBTztBQUFBLFlBQ1Q7QUFHQSxnQkFBSSxHQUFHLFNBQVMsZ0JBQWdCLEtBQUssR0FBRyxTQUFTLG9CQUFvQixHQUFHO0FBQ3RFLHFCQUFPO0FBQUEsWUFDVDtBQUdBLGdCQUFJLEdBQUcsU0FBUyxNQUFNLEtBQUssR0FBRyxTQUFTLGdCQUFnQixHQUFHO0FBQ3hELHFCQUFPO0FBQUEsWUFDVDtBQUdBLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEdBQUc7QUFDM0IscUJBQU87QUFBQSxZQUNUO0FBR0EsZ0JBQUksR0FBRyxTQUFTLGNBQWMsR0FBRztBQUMvQixxQkFBTztBQUFBLFlBQ1Q7QUFHQSxnQkFBSSxHQUFHLFNBQVMsU0FBUyxHQUFHO0FBQzFCLHFCQUFPO0FBQUEsWUFDVDtBQUdBLGdCQUFJLEdBQUcsU0FBUyxVQUFVLEtBQUssR0FBRyxTQUFTLE9BQU8sR0FBRztBQUNuRCxxQkFBTztBQUFBLFlBQ1Q7QUFHQSxnQkFBSSxHQUFHLFNBQVMsaUJBQWlCLEtBQUssR0FBRyxTQUFTLEtBQUssR0FBRztBQUN4RCxxQkFBTztBQUFBLFlBQ1Q7QUFHQSxtQkFBTztBQUFBLFVBQ1Q7QUFHQSxjQUFJLEdBQUcsU0FBUyxTQUFTLEdBQUc7QUFDMUIsa0JBQU0sV0FBVyxHQUFHLE1BQU0sU0FBUyxFQUFFLENBQUMsRUFBRSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsWUFBWTtBQUdsRSxnQkFBSSxDQUFDLFNBQVMsV0FBVyxjQUFjLFlBQVksRUFBRSxTQUFTLFFBQVEsR0FBRztBQUN2RSxxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxDQUFDLGNBQWMsb0JBQW9CLEVBQUUsU0FBUyxRQUFRLEdBQUc7QUFDM0QscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksQ0FBQyxhQUFhLHFCQUFxQixhQUFhLEVBQUUsU0FBUyxRQUFRLEdBQUc7QUFDeEUscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksQ0FBQyxZQUFZLGFBQWEsT0FBTyxFQUFFLFNBQVMsUUFBUSxHQUFHO0FBQ3pELHFCQUFPO0FBQUEsWUFDVDtBQUVBLG1CQUFPLFFBQVEsUUFBUTtBQUFBLFVBQ3pCO0FBR0EsY0FBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLGdCQUFJLEdBQUcsU0FBUyxNQUFNLEdBQUc7QUFDdkIscUJBQU87QUFBQSxZQUNUO0FBQ0EsZ0JBQUksR0FBRyxTQUFTLGFBQWEsR0FBRztBQUM5QixxQkFBTztBQUFBLFlBQ1Q7QUFDQSxnQkFBSSxHQUFHLFNBQVMsU0FBUyxHQUFHO0FBQzFCLHFCQUFPO0FBQUEsWUFDVDtBQUNBLGdCQUFJLEdBQUcsU0FBUyxjQUFjLEdBQUc7QUFDL0IscUJBQU87QUFBQSxZQUNUO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQTtBQUFBLElBRXZCLGVBQWU7QUFBQSxNQUNiLFVBQVU7QUFBQSxNQUNWLHFCQUFxQixDQUFDLEtBQUssU0FBUztBQUVsQyxZQUFJLElBQUksU0FBUyxhQUFhLEdBQUc7QUFDL0IsaUJBQU8sS0FBSztBQUFBLFlBQU8sU0FDakIsSUFBSSxTQUFTLGVBQWUsS0FDNUIsSUFBSSxTQUFTLGFBQWEsS0FDMUIsSUFBSSxTQUFTLFlBQVk7QUFBQSxVQUMzQjtBQUFBLFFBQ0Y7QUFDQSxZQUFJLElBQUksU0FBUyxrQkFBa0IsR0FBRztBQUNwQyxpQkFBTyxLQUFLO0FBQUEsWUFBTyxTQUNqQixJQUFJLFNBQVMsZUFBZSxLQUM1QixJQUFJLFNBQVMsUUFBUTtBQUFBLFVBQ3ZCO0FBQUEsUUFDRjtBQUNBLGVBQU8sQ0FBQztBQUFBLE1BQ1Y7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUdBLHNCQUFzQjtBQUFBO0FBQUEsSUFDdEIsT0FBTztBQUFBLElBQ1AsYUFBYTtBQUFBLEVBQ2Y7QUFBQTtBQUFBLEVBR0EsY0FBYztBQUFBLElBQ1osU0FBUztBQUFBLE1BQ1A7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsUUFBUTtBQUFBLElBQ04saUJBQWlCLEtBQUssVUFBVSxRQUFRLElBQUksdUJBQXVCLE9BQU87QUFBQSxJQUMxRSxnQkFBZ0IsS0FBSyxXQUFVLG9CQUFJLEtBQUssR0FBRSxZQUFZLENBQUM7QUFBQSxJQUN2RCxtQkFBbUIsU0FBUztBQUFBLEVBQzlCO0FBQUE7QUFBQSxFQUdBLEtBQUs7QUFBQSxJQUNILGNBQWMsU0FBUztBQUFBLEVBQ3pCO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K

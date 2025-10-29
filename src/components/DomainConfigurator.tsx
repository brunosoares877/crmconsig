import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Copy, Globe, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { getDomainInfo } from '@/utils/domainConfig';
import { toast } from 'sonner';

export const DomainConfigurator: React.FC = () => {
  const [customDomain, setCustomDomain] = useState('');
  const domainInfo = getDomainInfo();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const generateConfigCode = () => {
    const domain = customDomain.trim() || 'https://seudominio.com';
    return `// Configuração de domínio para links de email
export interface DomainConfig {
  production: string;
  development: string;
}

// Configure aqui seu domínio personalizado
const DOMAIN_CONFIG: DomainConfig = {
  // Coloque aqui seu domínio de produção personalizado
  production: "${domain}", // ← SEU DOMÍNIO AQUI
  
  // Desenvolvimento local
  development: "http://localhost:8080"
};`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            Configurador de Domínio
          </CardTitle>
          <CardDescription>
            Configure seu domínio personalizado para os links de recuperação de senha
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Status Atual */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Status Atual</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ambiente:</span>
                  <Badge variant={domainInfo.environment === 'production' ? 'default' : 'secondary'}>
                    {domainInfo.environment}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>URL Base:</span>
                  <span className="font-mono text-xs">{domainInfo.baseURL}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reset URL:</span>
                  <span className="font-mono text-xs">{domainInfo.resetPasswordURL}</span>
                </div>
                <div className="flex justify-between">
                  <span>Domínio Personalizado:</span>
                  {domainInfo.isCustomDomain ? (
                    <Badge className="bg-green-100 text-green-800">✅ Ativo</Badge>
                  ) : (
                    <Badge variant="destructive">❌ Não configurado</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Configuração</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Produção:</span>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1">
                    {domainInfo.configured.production}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Desenvolvimento:</span>
                  <div className="font-mono text-xs bg-gray-50 p-2 rounded mt-1">
                    {domainInfo.configured.development}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configurar Novo Domínio */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configurar Seu Domínio</h3>
            
            <div className="space-y-2">
              <Label htmlFor="customDomain">Seu Domínio de Produção</Label>
              <div className="flex gap-2">
                <Input
                  id="customDomain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  placeholder="https://meudominio.com"
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCustomDomain('https://')}
                >
                  Limpar
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Inclua https:// no início. Exemplo: https://meucrm.com
              </p>
            </div>

            {/* Preview da configuração */}
            {customDomain && (
              <Alert className="border-blue-500">
                <CheckCircle className="w-4 h-4" />
                <AlertDescription className="text-blue-700">
                  <div className="space-y-2">
                    <div><strong>Preview:</strong></div>
                    <div className="font-mono text-xs bg-blue-50 p-2 rounded">
                      Links de email redirecionarão para: {customDomain}/reset-password
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Código para copiar */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Código de Configuração</h3>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                {generateConfigCode()}
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => copyToClipboard(generateConfigCode())}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>

            <Alert className="border-orange-500">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-orange-700">
                <div className="space-y-2">
                  <div><strong>Como configurar:</strong></div>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Copie o código acima</li>
                    <li>Abra o arquivo <code className="bg-orange-100 px-1 rounded">src/utils/domainConfig.ts</code></li>
                    <li>Substitua a seção <code className="bg-orange-100 px-1 rounded">DOMAIN_CONFIG</code></li>
                    <li>Substitua <code className="bg-orange-100 px-1 rounded">{customDomain || 'https://seudominio.com'}</code> pelo seu domínio real</li>
                    <li>Salve o arquivo e reinicie o servidor de desenvolvimento</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* Instruções de Deploy */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuração para Produção</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-2">1. Supabase Dashboard</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Acessar Authentication → Settings</li>
                  <li>• Adicionar seu domínio em "Site URL"</li>
                  <li>• Adicionar em "Redirect URLs"</li>
                  <li>• Incluir /reset-password no final</li>
                </ul>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Abrir Supabase
                </Button>
              </Card>

              <Card className="p-4">
                <h4 className="font-medium mb-2">2. Deploy da Aplicação</h4>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Fazer deploy com domínio configurado</li>
                  <li>• Testar em ambiente de produção</li>
                  <li>• Verificar se emails funcionam</li>
                  <li>• Confirmar redirects corretos</li>
                </ul>
                <Button variant="outline" size="sm" className="mt-2" disabled>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Deploy Necessário
                </Button>
              </Card>
            </div>
          </div>

          {/* URLs de Exemplo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">URLs de Exemplo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-600">✅ URLs Corretas</h4>
                <ul className="space-y-1 font-mono text-xs bg-green-50 p-2 rounded">
                  <li>https://meucrm.com</li>
                  <li>https://app.minhaempresa.com</li>
                  <li>https://crm.vendas.com.br</li>
                  <li>https://leadconsig.seudominio.com</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-red-600">❌ URLs Incorretas</h4>
                <ul className="space-y-1 font-mono text-xs bg-red-50 p-2 rounded">
                  <li>meucrm.com (sem https://)</li>
                  <li>https://localhost:8080</li>
                  <li>https://app.lovable.dev</li>
                  <li>http://inseguro.com (sem SSL)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Teste Atual */}
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div><strong>Para testar agora:</strong></div>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Configure seu domínio no código acima</li>
                  <li>Vá para a tela de login</li>
                  <li>Clique em "Esqueci minha senha"</li>
                  <li>Digite um email e envie</li>
                  <li>Verifique o console para ver a URL de redirect</li>
                  <li>O email chegará com o link para seu domínio!</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}; 
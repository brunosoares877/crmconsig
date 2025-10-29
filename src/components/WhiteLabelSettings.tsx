import React, { useState } from 'react';
import { useWhiteLabel } from '@/contexts/WhiteLabelContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Upload } from 'lucide-react';

const WhiteLabelSettings = () => {
  const { config, updateConfig, uploadLogo, isLoading } = useWhiteLabel();
  const [primaryColor, setPrimaryColor] = useState(config.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(config.secondaryColor);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(config.logoUrl);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update colors
      await updateConfig({
        primaryColor,
        secondaryColor
      });
      
      // Upload logo if selected
      if (logoFile) {
        await uploadLogo(logoFile);
      }
      
      toast.success('Configurações de personalização salvas com sucesso!');
    } catch (error) {
      console.error('Error saving white label settings:', error);
      toast.error('Erro ao salvar as configurações. Tente novamente.');
    }
  };

  return (
    <Card className="w-full border border-gray-200 dark:border-gray-800 shadow-md">
      <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <CardTitle className="text-primary">Personalização do Sistema</CardTitle>
        <CardDescription>
          Configure as cores e o logo da sua empresa para personalizar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="logo" className="block mb-2 font-medium">Logo da Empresa</Label>
              <div className="flex items-center space-x-4">
                <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="max-w-full max-h-full object-contain" 
                      loading="lazy"
                    />
                  ) : (
                    <div className="text-gray-400 text-sm text-center">
                      Nenhum logo<br />selecionado
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <Label 
                    htmlFor="logo-upload" 
                    className="cursor-pointer flex items-center justify-center w-full h-10 border-2 border-dashed rounded-md hover:border-primary transition-colors"
                  >
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="sr-only"
                    />
                    <Upload className="mr-2 h-4 w-4" />
                    Escolher arquivo
                  </Label>
                  <p className="text-sm text-muted-foreground mt-2">
                    Recomendado: PNG ou SVG com fundo transparente, máximo 1MB
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primary-color" className="font-medium">Cor Primária</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    id="primary-color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input 
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#0D2357"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usada em botões, links e elementos de destaque
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondary-color" className="font-medium">Cor Secundária</Label>
                <div className="flex space-x-2">
                  <Input
                    type="color"
                    id="secondary-color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <Input 
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#193366"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Usada em elementos secundários e detalhes
                </p>
              </div>
            </div>
          </div>
          
          <div className="preview-section border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
            <h3 className="text-sm font-medium mb-2">Preview:</h3>
            <div className="flex flex-wrap gap-2">
              <div 
                className="w-32 h-10 rounded-md flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                Cor Primária
              </div>
              <div 
                className="w-32 h-10 rounded-md flex items-center justify-center text-white shadow-sm"
                style={{ backgroundColor: secondaryColor }}
              >
                Cor Secundária
              </div>
              <Button variant="default" className="h-10 shadow-sm">
                Botão Primário
              </Button>
              <Button variant="secondary" className="h-10 shadow-sm">
                Botão Secundário
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <Button 
          type="submit" 
          onClick={handleSubmit} 
          disabled={isLoading}
          className="shadow-sm"
        >
          {isLoading && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
          )}
          Salvar Configurações
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WhiteLabelSettings;

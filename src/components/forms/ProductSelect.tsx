import React, { useState, useMemo, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const DEFAULT_PRODUCTS = [
  { code: "CREDITO_PIX_CARTAO", name: "CREDITO PIX/CARTAO" },
  { code: "EMPRESTIMO_CONSIGNADO", name: "EMPRESTIMO CONSIGNADO" },
  { code: "CARTAO_CONSIGNADO", name: "CARTAO CONSIGNADO" },
  { code: "PORTABILIDADE", name: "PORTABILIDADE" },
  { code: "REFINANCIAMENTO", name: "REFINANCIAMENTO" },
  { code: "SAQUE_ANIVERSARIO", name: "SAQUE ANIVERSARIO" },
  { code: "ANTECIPACAO_13", name: "ANTECIPACAO 13º" }
];

interface ProductSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

const ProductSelect: React.FC<ProductSelectProps> = ({ value, onValueChange, defaultValue }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [configProducts, setConfigProducts] = useState([]);
  const [removedProducts, setRemovedProducts] = useState([]);
  const [editedProducts, setEditedProducts] = useState([]);

  // Função para carregar dados do localStorage
  const loadConfigData = () => {
    try {
      // Carregar produtos configurados
      const savedProducts = localStorage.getItem('configProducts');
      if (savedProducts) {
        setConfigProducts(JSON.parse(savedProducts));
      }

      // Carregar produtos removidos
      const savedRemoved = localStorage.getItem('removedProducts');
      if (savedRemoved) {
        setRemovedProducts(JSON.parse(savedRemoved));
      }

      // Carregar produtos editados
      const savedEdited = localStorage.getItem('editedProducts');
      if (savedEdited) {
        setEditedProducts(JSON.parse(savedEdited));
      }
    } catch (error) {
      console.error('Error loading config data:', error);
    }
  };

  useEffect(() => {
    loadConfigData();

    // Listener para mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'configProducts' || e.key === 'removedProducts' || e.key === 'editedProducts') {
        loadConfigData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listener customizado para mudanças na mesma aba
    const handleCustomStorageChange = () => {
      loadConfigData();
    };

    window.addEventListener('configDataChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('configDataChanged', handleCustomStorageChange);
    };
  }, []);

  const allProducts = useMemo(() => {
    // Combine default products with configured products
    const combined = [...DEFAULT_PRODUCTS];
    
    // Aplicar edições aos produtos padrão
    editedProducts.forEach((editedProduct: any) => {
      const defaultIndex = combined.findIndex(product => product.code === editedProduct.code);
      if (defaultIndex !== -1) {
        combined[defaultIndex] = {
          code: editedProduct.code,
          name: editedProduct.name
        };
      }
    });
    
    // Adicionar produtos configurados pelo usuário
    configProducts.forEach((configProduct: any) => {
      const exists = combined.find(product => product.code === configProduct.code);
      if (!exists) {
        combined.push({
          code: configProduct.code,
          name: configProduct.name
        });
      }
    });
    
    // Remover produtos que foram excluídos
    const filtered = combined.filter(product => {
      const removedId = `default-${product.code}`;
      return !removedProducts.includes(removedId);
    });
    
    return filtered.sort((a, b) => a.name.localeCompare(b.name));
  }, [configProducts, removedProducts, editedProducts]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts;
    
    const search = searchTerm.toLowerCase();
    return allProducts.filter(product => 
      product.code.toLowerCase().includes(search) || 
      product.name.toLowerCase().includes(search)
    );
  }, [searchTerm, allProducts]);

  return (
    <div>
      <Label htmlFor="product">Produto</Label>
      <Select value={value} onValueChange={onValueChange} defaultValue={defaultValue}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o produto" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por código ou nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <SelectItem key={product.code} value={product.name}>
                  {product.name}
                </SelectItem>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">
                Nenhum produto encontrado
              </div>
            )}
          </div>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ProductSelect;

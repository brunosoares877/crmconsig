import { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  { id: "default-p1", name: "CARTÃO INSS" },
  { id: "default-p2", name: "CREDITO CLT" },
  { id: "default-p3", name: "CREDITO FGTS" },
  { id: "default-p4", name: "CREDITO INSS" },
  { id: "default-p5", name: "CREDITO INSS BPC/LOAS" },
  { id: "default-p6", name: "CREDITO PESSOAL" },
  { id: "default-p7", name: "CREDITO PIX/CARTAO" },
  { id: "default-p8", name: "PORTABILIDADE INSS" },
  { id: "default-p9", name: "REFINANCIAMENTO" },
  { id: "default-p10", name: "SAQUE ANIVERSARIO" }
];

export const useProducts = () => {
  const [products, setProducts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = () => {
    try {
      setIsLoading(true);
      const savedProducts = localStorage.getItem('configProducts');
      const configuredProducts = savedProducts ? JSON.parse(savedProducts) : [];
      const removedProductIds = JSON.parse(localStorage.getItem('removedProducts') || '[]');
      const editedProducts = JSON.parse(localStorage.getItem('editedProducts') || '[]');
      
      const allProducts = new Set<string>();

      DEFAULT_PRODUCTS.forEach(product => {
        if (removedProductIds.includes(product.id)) return;
        const edited = editedProducts.find((p: any) => p.id === product.id);
        if (edited && edited.name) {
          allProducts.add(edited.name.trim());
        } else if (product.name) {
          allProducts.add(product.name.trim());
        }
      });

      configuredProducts.forEach((p: any) => {
        if (p && p.name) {
          allProducts.add(p.name.trim());
        }
      });

      const uniqueProducts = Array.from(allProducts).sort();
      setProducts(uniqueProducts);
    } catch (error) {
      console.error('Erro ao carregar produtos configurados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'configProducts' || e.key === 'removedProducts' || e.key === 'editedProducts') {
        fetchProducts();
      }
    };

    const handleCustomStorageChange = () => {
      fetchProducts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('configDataChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('configDataChanged', handleCustomStorageChange);
    };
  }, []);

  return {
    products,
    isLoading,
    refetch: fetchProducts
  };
};

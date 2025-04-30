import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CommissionRate, CommissionTier } from "@/types/models";

const CommissionSettings = () => {
  const [rates, setRates] = useState<CommissionRate[]>([]);
  const [tiers, setTiers] = useState<CommissionTier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCommissionRates();
  }, []);

  const fetchCommissionRates = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const data: CommissionRate[] = [
        {
          id: "1",
          user_id: "user1",
          product: "Empréstimo Consignado",
          name: "Taxa padrão consignado", // Add name property
          percentage: 2.5,
          active: true,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z"
        },
        {
          id: "2",
          user_id: "user1",
          product: "Cartão de Crédito",
          name: "Taxa padrão cartão", // Add name property
          percentage: 3,
          active: true,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z"
        }
      ];
      
      setRates(data);
      
      // Also update the commission tiers data
      const tiersData: CommissionTier[] = [
        {
          id: "1",
          user_id: "user1",
          product: "Empréstimo Consignado",
          name: "Nível inicial", // Add name property
          min_amount: 0,
          max_amount: 5000,
          percentage: 2,
          active: true,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z"
        },
        {
          id: "2",
          user_id: "user1",
          product: "Empréstimo Consignado",
          name: "Nível intermediário", // Add name property
          min_amount: 5001,
          max_amount: 10000,
          percentage: 2.5,
          active: true,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z"
        },
        {
          id: "3",
          user_id: "user1",
          product: "Empréstimo Consignado",
          name: "Nível premium", // Add name property
          min_amount: 10001,
          max_amount: 50000,
          percentage: 3,
          active: true,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z"
        }
      ];
      
      setTiers(tiersData);
    } catch (error) {
      console.error("Error fetching commission rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateActivation = (id: string, active: boolean) => {
    setRates(rates.map(rate =>
      rate.id === id ? { ...rate, active: !active } : rate
    ));
  };

  const handleTierActivation = (id: string, active: boolean) => {
    setTiers(tiers.map(tier =>
      tier.id === id ? { ...tier, active: !active } : tier
    ));
  };

  return (
    <div className="container mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Configurações de Comissões</h1>

      {/* Commission Rates Table */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Taxas de Comissão</h2>
        <Table>
          <TableCaption>Lista de taxas de comissão por produto.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Produto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Percentagem</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rates.map((rate) => (
              <TableRow key={rate.id}>
                <TableCell className="font-medium">{rate.product}</TableCell>
                <TableCell>{rate.name}</TableCell>
                <TableCell>{rate.percentage}%</TableCell>
                <TableCell>
                  <Switch
                    id={`rate-active-${rate.id}`}
                    checked={rate.active}
                    onCheckedChange={() => handleRateActivation(rate.id, rate.active)}
                  />
                  <Label
                    htmlFor={`rate-active-${rate.id}`}
                    className="sr-only"
                  >
                    Ativo
                  </Label>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5} className="text-right">
                <Button>Adicionar Taxa</Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>

      {/* Commission Tiers Table */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Níveis de Comissão</h2>
        <Table>
          <TableCaption>Lista de níveis de comissão por produto e valor.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Produto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Valor Mínimo</TableHead>
              <TableHead>Valor Máximo</TableHead>
              <TableHead>Percentagem</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tiers.map((tier) => (
              <TableRow key={tier.id}>
                <TableCell className="font-medium">{tier.product}</TableCell>
                <TableCell>{tier.name}</TableCell>
                <TableCell>{tier.min_amount}</TableCell>
                <TableCell>{tier.max_amount}</TableCell>
                <TableCell>{tier.percentage}%</TableCell>
                <TableCell>
                  <Switch
                    id={`tier-active-${tier.id}`}
                    checked={tier.active}
                    onCheckedChange={() => handleTierActivation(tier.id, tier.active)}
                  />
                  <Label
                    htmlFor={`tier-active-${tier.id}`}
                    className="sr-only"
                  >
                    Ativo
                  </Label>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm">Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={7} className="text-right">
                <Button>Adicionar Nível</Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default CommissionSettings;

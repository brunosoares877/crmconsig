
import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEmployees, Employee } from "@/utils/employees";

interface EmployeeSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EmployeeSelect = ({ value, onValueChange, disabled, placeholder = "Selecione um funcionário" }: EmployeeSelectProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Log apenas quando há valor específico para debug
  if (value && value !== "none") {
    console.log("EmployeeSelect - Employee value:", value);
  }

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        console.log("EmployeeSelect - Fetched employees:", data);
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando funcionários..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (employees.length === 0) {
    console.warn("⚠️ EmployeeSelect - Nenhum funcionário encontrado");
    console.warn("💡 Verifique se há funcionários cadastrados em: Menu → Funcionários");
  }

  const handleValueChange = (newValue: string) => {
    console.log("🔄 EmployeeSelect handleValueChange:", newValue);
    onValueChange(newValue);
  };

  const currentValue = value || "none";
  console.log("🎯 EmployeeSelect rendering with value:", currentValue);

  return (
    <Select value={currentValue} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Nenhum funcionário</SelectItem>
        {employees.length === 0 ? (
          <>
            <SelectItem value="no-employees" disabled className="text-red-600">
              ⚠️ Nenhum funcionário cadastrado
            </SelectItem>
            <SelectItem value="help" disabled className="text-blue-600 text-xs">
              💡 Vá em Menu → Funcionários para cadastrar
            </SelectItem>
          </>
        ) : (
          employees.map((employee) => (
            <SelectItem key={employee.id} value={employee.name}>
              {employee.name} {currentValue === employee.name && "✓"}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default EmployeeSelect;

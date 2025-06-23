
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

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
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

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {employees.length === 0 ? (
          <SelectItem value="none" disabled>
            Nenhum funcionário cadastrado
          </SelectItem>
        ) : (
          employees.map((employee) => (
            <SelectItem key={employee.id} value={employee.name}>
              {employee.name}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default EmployeeSelect;

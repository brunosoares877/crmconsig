import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { useBanks } from "@/hooks/useBanks";
import { Loader2, Check, ChevronsUpDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface BankSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  required?: boolean;
  showNoneOption?: boolean;
}

export const BankSelect: React.FC<BankSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Selecione um banco",
  label,
  className,
  required = false,
  showNoneOption = true
}) => {
  const { banks, isLoading, error } = useBanks();
  const [open, setOpen] = useState(false);

  if (error) {
    console.error("Erro ao carregar bancos:", error);
  }

  const selectedBank = banks.find((bank) => bank.code === value);

  // Filtrar bancos válidos (com código)
  const validBanks = banks.filter((bank) => bank.code && bank.code.trim() !== "");

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Carregando bancos...</span>
              </div>
            ) : selectedBank ? (
              <div className="flex items-center gap-2 flex-1 justify-start">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{selectedBank.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  ({selectedBank.code})
                </span>
              </div>
            ) : value === "none" ? (
              <span className="text-muted-foreground">Nenhum banco</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start" onWheel={(e) => e.stopPropagation()}>
          <Command shouldFilter={true}>
            <CommandInput 
              placeholder="Buscar banco por nome ou código..." 
              className="h-9"
            />
            <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden" style={{ overscrollBehavior: 'contain' }}>
              <CommandEmpty>
                Nenhum banco encontrado.
              </CommandEmpty>
              {showNoneOption && (
                <CommandGroup>
                  <CommandItem
                    value="none"
                    onSelect={() => {
                      onValueChange("none");
                      setOpen(false);
                    }}
                    className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === "none" ? "opacity-100" : "opacity-0"
                      )}
                    />
                    Nenhum banco
                  </CommandItem>
                </CommandGroup>
              )}
              {validBanks.length > 0 && (
                <CommandGroup>
                  {validBanks.map((bank) => (
                    <CommandItem
                      key={bank.code}
                      value={`${bank.name} ${bank.code}`}
                      onSelect={() => {
                        onValueChange(bank.code);
                        setOpen(false);
                      }}
                      className="hover:bg-blue-50 hover:text-foreground cursor-pointer transition-colors"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === bank.code ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{bank.name}</span>
                        </span>
                        <span className="text-xs text-muted-foreground ml-4">
                          {bank.code}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

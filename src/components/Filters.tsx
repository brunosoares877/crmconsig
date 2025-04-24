
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LeadForm from "./LeadForm";

const Filters = () => {
  const [isOpenSheet, setIsOpenSheet] = useState(false);
  
  const handleLeadSubmit = (values: any) => {
    console.log("New lead:", values);
    setIsOpenSheet(false);
  };

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="h-8 gap-1">
              <Filter className="h-3.5 w-3.5" />
              <span>Filtros</span>
            </Button>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="h-8 gap-1 pl-2 pr-1">
                Novos
                <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-transparent">
                  &times;
                </Button>
              </Badge>
              <Badge variant="outline" className="h-8 gap-1 pl-2 pr-1">
                Últimos 30 dias
                <Button variant="ghost" className="h-5 w-5 p-0 hover:bg-transparent">
                  &times;
                </Button>
              </Badge>
            </div>
          </div>
          
          <div className="flex w-full items-center space-x-2 md:w-auto">
            <div className="relative w-full md:w-[180px]">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar leads" className="pl-8" />
            </div>
            <Select defaultValue="todos">
              <SelectTrigger className="h-8 w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="contatado">Contatado</SelectItem>
                <SelectItem value="qualificado">Qualificado</SelectItem>
                <SelectItem value="negociando">Negociando</SelectItem>
                <SelectItem value="convertido">Convertido</SelectItem>
                <SelectItem value="perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
            
            <Sheet open={isOpenSheet} onOpenChange={setIsOpenSheet}>
              <SheetTrigger asChild>
                <Button className="h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Novo Lead</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto">
                <SheetHeader className="mb-4">
                  <SheetTitle>Adicionar Novo Lead</SheetTitle>
                  <SheetDescription>
                    Preencha os dados do novo lead no formulário abaixo.
                  </SheetDescription>
                </SheetHeader>
                <LeadForm 
                  onSubmit={handleLeadSubmit}
                  onCancel={() => setIsOpenSheet(false)} 
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;

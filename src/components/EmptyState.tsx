
import React from "react";
import { UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = () => {
  return (
    <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-8 text-center animate-fade-in">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <UsersRound className="h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-6 text-xl font-semibold">Nenhum lead encontrado</h3>
      <p className="mb-6 mt-2 max-w-sm text-sm text-muted-foreground">
        Parece que você ainda não tem leads registrados ou os filtros atuais não retornaram resultados.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary">Importar Leads</Button>
        <Button>Adicionar Lead</Button>
      </div>
    </div>
  );
};

export default EmptyState;

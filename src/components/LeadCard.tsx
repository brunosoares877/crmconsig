
import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, MoreVertical } from "lucide-react";

// Define lead types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  status: "novo" | "contatado" | "qualificado" | "negociando" | "convertido" | "perdido";
  loanValue?: string;
  source?: string;
}

// Status color map
const statusColorMap = {
  novo: "bg-blue-100 text-blue-800",
  contatado: "bg-purple-100 text-purple-800",
  qualificado: "bg-amber-100 text-amber-800",
  negociando: "bg-emerald-100 text-emerald-800",
  convertido: "bg-green-100 text-green-800",
  perdido: "bg-gray-100 text-gray-800"
};

interface LeadCardProps {
  lead: Lead;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead }) => {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md animate-fade-in">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-medium">{lead.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-1 h-3.5 w-3.5" />
              <span>{lead.email}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="mr-1 h-3.5 w-3.5" />
              <span>{lead.phone}</span>
            </div>
            {lead.loanValue && (
              <div className="text-sm font-medium">
                Valor: <span className="text-green-600">{lead.loanValue}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <Badge
              variant="outline"
              className={`${statusColorMap[lead.status]}`}
            >
              {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
            </Badge>

            {lead.source && (
              <span className="text-xs text-muted-foreground">
                Via {lead.source}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between bg-muted/30 px-4 py-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1 h-3.5 w-3.5" />
          <span>Adicionado em {lead.createdAt}</span>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="secondary" size="sm">
            <Phone className="mr-1 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ligar</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <MoreVertical className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default LeadCard;

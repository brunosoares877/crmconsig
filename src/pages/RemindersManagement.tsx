import React from "react";
import { useNavigate } from "react-router-dom";
import { Check, Clock, X } from "lucide-react";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const RemindersManagement = () => {
  const navigate = useNavigate();

  // In a real implementation, this would fetch reminders from Supabase
  // For now, we'll redirect to the main reminders page
  React.useEffect(() => {
    navigate("/reminders");
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto p-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Gestão de Lembretes</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="flex items-center text-green-700">
                  <Check className="mr-2 h-5 w-5" />
                  Finalizados
                </CardTitle>
                <CardDescription>Lembretes concluídos</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">Carregando...</div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/reminders")}>
                  Ver detalhes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center text-red-700">
                  <Clock className="mr-2 h-5 w-5" />
                  Atrasados
                </CardTitle>
                <CardDescription>Lembretes atrasados</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">Carregando...</div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/reminders")}>
                  Ver detalhes
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center text-blue-700">
                  <X className="mr-2 h-5 w-5" />
                  Pendentes
                </CardTitle>
                <CardDescription>Lembretes pendentes</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold">Carregando...</div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate("/reminders")}>
                  Ver detalhes
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Table>
            <TableCaption>Redirecionando para a página principal de lembretes...</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </main>
      </div>
    </div>
  );
};

export default RemindersManagement;

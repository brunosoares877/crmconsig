
import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import LeadForm from "@/components/LeadForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LeadNew = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleFormSubmit = async (values: any) => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase.from("leads").insert({
        ...values,
        user_id: userData.user.id,
      });

      if (error) throw error;
      
      toast.success("Lead cadastrado com sucesso!");
      navigate("/leads");
    } catch (error: any) {
      toast.error(`Erro ao cadastrar lead: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 transition-all duration-300">
        <Header />
        <main className="container mx-auto space-y-6 p-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Novo Lead</h1>
              <p className="text-muted-foreground mt-1">Cadastre um novo lead no sistema</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Formulário de Cadastro</CardTitle>
              <CardDescription>
                Preencha os dados do novo lead abaixo. Campos marcados com * são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LeadForm 
                onSubmit={handleFormSubmit} 
                onCancel={() => navigate(-1)}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default LeadNew;

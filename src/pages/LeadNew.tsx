import React from "react";
import Header from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
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

      const { selectedTags, ...leadData } = values;

      // Log para debug
      console.log("Inserting lead data:", leadData);
      console.log("Payment period value:", leadData.payment_period, typeof leadData.payment_period);

      const { data: leadInsertData, error: leadError } = await supabase
        .from("leads")
        .insert({
          ...leadData,
          user_id: userData.user.id,
        })
        .select()
        .single();

      if (leadError) {
        console.error("Database error:", leadError);
        throw leadError;
      }

      // Save tag assignments if any tags were selected
      if (selectedTags && selectedTags.length > 0) {
        const tagAssignments = selectedTags.map((tagId: string) => ({
          lead_id: leadInsertData.id,
          tag_id: tagId,
          user_id: userData.user.id,
        }));

        const { error: tagError } = await (supabase as any)
          .from('lead_tag_assignments')
          .insert(tagAssignments);

        if (tagError) {
          console.error('Error saving tag assignments:', tagError);
          toast.error('Lead salvo, mas erro ao aplicar etiquetas');
        }
      }
      
      toast.success("Lead cadastrado com sucesso!");
      navigate("/leads");
    } catch (error: any) {
      console.error("Error creating lead:", error);
      toast.error(`Erro ao cadastrar lead: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
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

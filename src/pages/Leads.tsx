
import React, { useState } from "react";
import Header from "@/components/Header";
import LeadList from "@/components/LeadList";
import Filters from "@/components/Filters";
import Sidebar from "@/components/Sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Leads = () => {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64 transition-all duration-300">
        <Header />
        <main className="container mx-auto space-y-6 p-4 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Gestão de Leads</h1>
              <p className="text-muted-foreground mt-1">Gerencie e acompanhe todos os seus leads em um só lugar</p>
            </div>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-5 w-full max-w-4xl mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="new">Novos</TabsTrigger>
              <TabsTrigger value="contacted">Contatados</TabsTrigger>
              <TabsTrigger value="qualified">Qualificados</TabsTrigger>
              <TabsTrigger value="converted">Convertidos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl">153</CardTitle>
                    <CardDescription>Total de Leads</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl text-blue-600">45</CardTitle>
                    <CardDescription>Novos Leads</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Aguardando primeiro contato
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl text-amber-600">28</CardTitle>
                    <CardDescription>Leads Qualificados</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Prontos para negociação
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-2xl text-green-600">12</CardTitle>
                    <CardDescription>Conversões</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Este mês
                    </div>
                  </CardContent>
                </Card>
              </div>
              <LeadList />
            </TabsContent>
            
            <TabsContent value="new">
              <LeadList />
            </TabsContent>
            
            <TabsContent value="contacted">
              <LeadList />
            </TabsContent>
            
            <TabsContent value="qualified">
              <LeadList />
            </TabsContent>
            
            <TabsContent value="converted">
              <LeadList />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Leads;

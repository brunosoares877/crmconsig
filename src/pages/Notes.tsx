import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import NotesBlock from "@/components/NotesBlock";
import StickyQuickNote from "@/components/StickyQuickNote";

const Notes = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 w-full flex">
        <AppSidebar />
        <div className="flex-1 w-full overflow-hidden min-w-0">
          <Header />
          <main className="w-full h-full">
            <div className="p-6 space-y-6">
              {/* Header moderno customizado */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl mb-8 shadow-xl">
                <div className="p-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold">Bloco de Notas</h1>
                        <p className="text-blue-100 text-lg mt-1">Organize suas anotações e ideias importantes</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Componente de Bloco de Notas */}
              <NotesBlock />
            </div>
          </main>
        </div>
        <StickyQuickNote />
      </div>
    </SidebarProvider>
  );
};

export default Notes;


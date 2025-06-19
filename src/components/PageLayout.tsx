
import React from "react";
import Header from "@/components/Header";
import TrialBanner from "@/components/TrialBanner";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  showTrialBanner?: boolean;
}

const PageLayout = ({ 
  children, 
  title, 
  subtitle, 
  headerActions, 
  showTrialBanner = true 
}: PageLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 w-full flex">
        <AppSidebar />
        <div className="flex-1 w-full overflow-hidden">
          <Header />
          <main className="w-full h-full">
            <div className="w-full space-y-8 h-full">
              {showTrialBanner && (
                <div className="flex items-center gap-4 px-6 py-3">
                  <TrialBanner />
                </div>
              )}
              
              {(title || headerActions) && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 px-6">
                  {title && (
                    <div className="space-y-2">
                      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-slate-600 text-lg font-medium">{subtitle}</p>
                      )}
                    </div>
                  )}
                  {headerActions && (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                      {headerActions}
                    </div>
                  )}
                </div>
              )}
              
              <div className="px-6 pb-6">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PageLayout;

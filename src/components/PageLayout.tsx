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
        <div className="flex-1 w-full overflow-hidden min-w-0">
          <Header />
          <main className="w-full h-full">
            <div className="w-full space-y-4 lg:space-y-8 h-full">
              {showTrialBanner && (
                <div className="flex items-center gap-4 px-4 notebook:px-5 lg:px-6 py-2 lg:py-3">
                  <TrialBanner />
                </div>
              )}
              
              {(title || headerActions) && (
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6 mb-6 lg:mb-8 px-4 notebook:px-5 lg:px-6">
                  {title && (
                    <div className="space-y-1 lg:space-y-2">
                      <h1 className="text-2xl notebook:text-3xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
                        {title}
                      </h1>
                      {subtitle && (
                        <p className="text-slate-600 text-base notebook:text-base lg:text-lg font-medium">{subtitle}</p>
                      )}
                    </div>
                  )}
                  {headerActions && (
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
                      {headerActions}
                    </div>
                  )}
                </div>
              )}
              
              <div className="px-4 notebook:px-5 lg:px-6 pb-4 lg:pb-6 content-responsive">
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

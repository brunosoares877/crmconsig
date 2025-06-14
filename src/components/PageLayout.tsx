
import React from "react";
import Header from "@/components/Header";
import TrialBanner from "@/components/TrialBanner";
import { AppSidebar } from "@/components/AppSidebar";

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
    <div className="min-h-screen bg-slate-50/30 w-full flex">
      <AppSidebar />
      <div className="flex-1 w-full overflow-hidden">
        <Header />
        <main className="w-full h-full">
          <div className="w-full space-y-6 h-full">
            {showTrialBanner && (
              <div className="flex items-center gap-4 px-4 py-2">
                <TrialBanner />
              </div>
            )}
            
            {(title || headerActions) && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-4">
                {title && (
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{title}</h1>
                    {subtitle && (
                      <p className="text-slate-600 text-base mt-2">{subtitle}</p>
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
            
            <div className="px-4 pb-4">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageLayout;

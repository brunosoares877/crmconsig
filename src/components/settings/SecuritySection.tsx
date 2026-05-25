
import React from "react";
import { PasswordSection } from "./PasswordSection";
import { AdminPasswordSection } from "./AdminPasswordSection";

export default function SecuritySection() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Segurança</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Gerencie suas opções de segurança e altere sua senha
        </p>
      </div>
      
      <PasswordSection />
      
      <AdminPasswordSection />
    </div>
  );
}

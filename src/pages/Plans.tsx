
import React from "react";
import SubscriptionPlans from "@/components/sales/SubscriptionPlans";
import PageLayout from "@/components/PageLayout";

const PaymentPlans = () => {
  return (
    <PageLayout 
      title="Escolha seu Plano"
      subtitle="Selecione o plano que melhor se adequa às suas necessidades"
      showTrialBanner={false}
    >
      <div className="py-8">
        <SubscriptionPlans />
      </div>
    </PageLayout>
  );
};

export default PaymentPlans;

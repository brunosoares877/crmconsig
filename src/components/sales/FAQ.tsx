
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "Como funciona o período de teste gratuito de 7 dias?",
      answer: "Durante os 7 dias de teste, você terá acesso completo a todas as funcionalidades do sistema sem nenhuma limitação. Não é necessário cartão de crédito para começar. Após o período, você pode escolher o plano que melhor se adequa às suas necessidades."
    },
    {
      question: "Posso cancelar minha assinatura a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura a qualquer momento através das configurações da sua conta. Não há multas ou comissões de cancelamento. Você continuará tendo acesso ao sistema até o final do período já pago."
    },
    {
      question: "Quantos leads posso gerenciar no sistema?",
      answer: "Não há limite para a quantidade de leads que você pode cadastrar e gerenciar no sistema. Todos os planos incluem gerenciamento ilimitado de leads, propostas e clientes."
    },
    {
      question: "O sistema funciona no celular?",
      answer: "Sim! O LeadConsig é totalmente responsivo e funciona perfeitamente em smartphones, tablets e computadores. Você pode acessar seus leads e gerenciar seu negócio de qualquer lugar."
    },
    {
      question: "Que tipo de suporte vocês oferecem?",
      answer: "Oferecemos suporte por WhatsApp e email para todos os planos. Os planos Semestral e Anual incluem suporte prioritário com tempo de resposta mais rápido. Nossa equipe está sempre pronta para ajudar você a ter sucesso."
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-white w-full">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
              Perguntas Frequentes
            </h2>
          </div>
          <p className="text-lg text-gray-600">
            Tire suas dúvidas sobre o LeadConsig
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-gray-50 rounded-lg border border-gray-200 px-6"
            >
              <AccordionTrigger className="text-left font-semibold text-gray-800 hover:text-blue-600 text-base md:text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm md:text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;

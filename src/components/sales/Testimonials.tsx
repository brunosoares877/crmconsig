
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Corretora Autônoma",
    content: "O CRM revolucionou minha forma de trabalhar! Consigo gerenciar todos meus leads de forma organizada e aumentei minhas vendas em 40% no primeiro mês.",
    stars: 5,
    date: "2 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "João Santos",
    role: "Gerente Comercial",
    content: "Excelente sistema! A interface é intuitiva e o suporte é muito atencioso. Recomendo para qualquer profissional do mercado de consignado.",
    stars: 5,
    date: "1 mês atrás",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ana Paula Oliveira",
    role: "Consultora Financeira",  
    content: "O melhor investimento que fiz para meu negócio. O controle de leads e o acompanhamento das propostas ficou muito mais fácil.",
    stars: 5,
    date: "3 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Carlos Eduardo",
    role: "Correspondente Bancário",
    content: "Sistema completo e prático. A função de lembretes me ajuda a não perder nenhuma oportunidade de venda.",
    stars: 5,
    date: "1 mês atrás",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Patricia Mendes",
    role: "Supervisora Comercial",
    content: "Ferramenta indispensável! O dashboard com métricas em tempo real me ajuda a tomar decisões mais assertivas.",
    stars: 5,
    date: "2 meses atrás",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Roberto Lima",
    role: "Consultor de Crédito",
    content: "Aumentei minha produtividade em 60%! O sistema me permite focar no que realmente importa: fechar negócios.",
    stars: 5,
    date: "3 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Fernanda Costa",
    role: "Analista Comercial",
    content: "Nunca foi tão fácil acompanhar o funil de vendas. O CRM me dá total controle sobre meus processos.",
    stars: 5,
    date: "1 semana atrás",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Diego Almeida",
    role: "Gerente de Relacionamento",
    content: "A automação dos lembretes salvou meu negócio! Não perco mais nenhum follow-up importante.",
    stars: 5,
    date: "2 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Lucia Fernandes",
    role: "Diretora Comercial",
    content: "Sistema robusto e confiável. Minha equipe triplicou os resultados desde que começamos a usar o LeadConsig.",
    stars: 5,
    date: "1 mês atrás",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-primary/10 to-transparent">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Depoimentos de nossos clientes
        </h2>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.slice(0, 8).map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-gray-600">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-0.5 mb-3">
                    {Array(testimonial.stars).fill(null).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">{testimonial.date}</p>
                  <p className="text-sm">{testimonial.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

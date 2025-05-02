
import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Corretora Autônoma",
    content: "O CRM revolucionou minha forma de trabalhar! Consigo gerenciar todos meus leads de forma organizada e aumentei minhas vendas em 40% no primeiro mês.",
    stars: 5,
    date: "2 semanas atrás"
  },
  {
    name: "João Santos",
    role: "Gerente Comercial",
    content: "Excelente sistema! A interface é intuitiva e o suporte é muito atencioso. Recomendo para qualquer profissional do mercado de consignado.",
    stars: 5,
    date: "1 mês atrás"
  },
  {
    name: "Ana Paula Oliveira",
    role: "Consultora Financeira",
    content: "O melhor investimento que fiz para meu negócio. O controle de leads e o acompanhamento das propostas ficou muito mais fácil.",
    stars: 5,
    date: "3 semanas atrás"
  },
  {
    name: "Carlos Eduardo",
    role: "Correspondente Bancário",
    content: "Sistema completo e prático. A função de lembretes me ajuda a não perder nenhuma oportunidade de venda.",
    stars: 5,
    date: "1 mês atrás"
  },
  {
    name: "Patricia Mendes",
    role: "Supervisora Comercial",
    content: "Ferramenta indispensável! O dashboard com métricas em tempo real me ajuda a tomar decisões mais assertivas.",
    stars: 5,
    date: "2 meses atrás"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-primary/10 to-transparent">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Depoimentos de nossos clientes
        </h2>
        
        <div className="max-w-5xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex gap-0.5 mb-3">
                        {Array(testimonial.stars).fill(null).map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{testimonial.date}</p>
                      <p className="mb-4">{testimonial.content}</p>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex">
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const testimonials = [
  {
    name: "Maria Silva",
    role: "Corretora Autônoma",
    content: "O LeadConsig transformou minha rotina! Agora consigo acompanhar meus clientes com muito mais facilidade e fechei o dobro de contratos no último mês. Recomendo para todos que querem crescer de verdade!",
    stars: 5,
    date: "2 semanas atrás",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "João Santos",
    role: "Gerente Comercial",
    content: "Nunca vi um sistema tão intuitivo! O suporte é excelente e minha equipe ficou muito mais produtiva. O painel de métricas em tempo real é sensacional.",
    stars: 5,
    date: "1 mês atrás",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ana Paula Oliveira",
    role: "Consultora Financeira",  
    content: "A automação dos lembretes e o controle de propostas me deram mais tempo para focar no cliente. O LeadConsig é meu braço direito!",
    stars: 5,
    date: "3 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Carlos Eduardo",
    role: "Correspondente Bancário",
    content: "Ferramenta completa! Não perco mais nenhum lead e consigo acompanhar todo o funil de vendas. O resultado foi um aumento de 50% nas conversões.",
    stars: 5,
    date: "1 mês atrás",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Patricia Mendes",
    role: "Supervisora Comercial",
    content: "O dashboard com métricas em tempo real me ajuda a tomar decisões rápidas e certeiras. O LeadConsig virou indispensável para minha equipe!",
    stars: 5,
    date: "2 meses atrás",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Roberto Lima",
    role: "Consultor de Crédito",
    content: "Aumentei minha produtividade em 60%! O sistema é rápido, confiável e me permite focar no que realmente importa: fechar negócios.",
    stars: 5,
    date: "3 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Fernanda Costa",
    role: "Analista Comercial",
    content: "Nunca foi tão fácil acompanhar o funil de vendas. O CRM me dá total controle sobre meus processos e clientes.",
    stars: 5,
    date: "1 semana atrás",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Diego Almeida",
    role: "Gerente de Relacionamento",
    content: "A automação dos lembretes salvou meu negócio! Não perco mais nenhum follow-up importante e meus clientes elogiam o atendimento.",
    stars: 5,
    date: "2 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Lucia Fernandes",
    role: "Diretora Comercial",
    content: "Sistema robusto e confiável. Minha equipe triplicou os resultados desde que começamos a usar o LeadConsig. Recomendo!",
    stars: 5,
    date: "1 mês atrás",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Marcos Pereira",
    role: "Consultor Sênior",
    content: "Interface limpa e funcional. Organizei minha carteira de clientes em poucas horas e nunca mais perdi um contato importante.",
    stars: 5,
    date: "1 semana atrás",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b742?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Juliana Rodrigues",
    role: "Agente de Crédito",
    content: "O suporte técnico é excepcional! Sempre que preciso, sou atendida rapidamente e com muita atenção.",
    stars: 5,
    date: "2 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Rafael Martins",
    role: "Supervisor de Vendas",
    content: "Implementamos o sistema em toda a equipe. Os resultados foram impressionantes já no primeiro trimestre!",
    stars: 5,
    date: "3 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Camila Torres",
    role: "Assessora Comercial",
    content: "A praticidade para agendar follow-ups e controlar prazos transformou completamente minha rotina de trabalho.",
    stars: 5,
    date: "1 mês atrás",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Eduardo Nascimento",
    role: "Gerente Regional",
    content: "Visibilidade total do pipeline de vendas. Agora consigo acompanhar o desempenho da equipe em tempo real.",
    stars: 5,
    date: "2 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Isabela Campos",
    role: "Consultora de Negócios",
    content: "A integração com WhatsApp facilitou muito o contato com os clientes. Comunicação muito mais eficiente!",
    stars: 5,
    date: "1 semana atrás",
    avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Thiago Barbosa",
    role: "Coordenador Comercial",
    content: "Relatórios detalhados que me ajudam a identificar oportunidades e otimizar processos. Ferramenta completa!",
    stars: 5,
    date: "3 semanas atrás",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Vanessa Duarte",
    role: "Especialista em Crédito",
    content: "Sistema intuitivo e poderoso. Consegui dobrar minha conversão de leads em apenas dois meses de uso.",
    stars: 5,
    date: "1 mês atrás",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  }
];

const FAKE_AVATAR = "https://randomuser.me/api/portraits/men/32.jpg";

const Testimonials = () => {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: false })
  );

  return (
    <section className="py-16 md:py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Depoimentos de nossos clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Veja o que nossos clientes dizem sobre o LeadConsig
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                  <Card className="h-full shadow-lg hover:shadow-xl transition-shadow duration-300 border-0">
                    <CardContent className="p-6">
                      <div className="flex gap-0.5 mb-4">
                        {Array(testimonial.stars).fill(null).map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <blockquote className="text-gray-700 mb-6 text-base leading-relaxed italic">
                        "{testimonial.content}"
                      </blockquote>
                      
                      <div className="flex items-center gap-3">
                        <img
                          src={testimonial.avatar || FAKE_AVATAR}
                          alt={testimonial.name}
                          className="h-12 w-12 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                          onError={e => {
                            if (e.currentTarget.src !== FAKE_AVATAR) {
                              e.currentTarget.src = FAKE_AVATAR;
                            }
                          }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.name}</p>
                          <p className="text-sm text-gray-600">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

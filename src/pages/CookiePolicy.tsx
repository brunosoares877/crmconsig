
import React from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:ml-64">
        <Header />
        <main className="container mx-auto p-4 py-8 space-y-6">
          <h1 className="text-3xl font-bold">Política de Cookies</h1>
          
          <div className="prose max-w-none">
            <h2>O que são Cookies?</h2>
            <p>
              Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo 
              (computador, smartphone ou tablet) quando você visita um site. Eles são amplamente 
              utilizados para fazer os sites funcionarem de forma mais eficiente e fornecer 
              informações aos proprietários do site.
            </p>

            <h2>Como usamos os Cookies?</h2>
            <p>
              Usamos cookies para entender como você utiliza nosso site e para melhorar sua experiência. 
              Por exemplo, cookies nos ajudam a:
            </p>
            <ul>
              <li>Manter você conectado durante sua visita</li>
              <li>Lembrar suas preferências e configurações</li>
              <li>Melhorar a velocidade e segurança do site</li>
              <li>Permitir que você compartilhe páginas nas redes sociais</li>
              <li>Oferecer anúncios relevantes aos seus interesses</li>
            </ul>

            <h2>Que tipos de Cookies utilizamos?</h2>
            <p><strong>Cookies essenciais:</strong> Necessários para o funcionamento básico do site.</p>
            <p><strong>Cookies de preferências:</strong> Permitem que o site lembre suas preferências.</p>
            <p><strong>Cookies estatísticos:</strong> Nos ajudam a entender como os visitantes interagem com o site.</p>
            <p><strong>Cookies de marketing:</strong> Usados para rastrear visitantes em sites.</p>

            <h2>Gerenciamento de Cookies</h2>
            <p>
              Você pode controlar e/ou excluir cookies conforme desejar. Você pode excluir todos os cookies 
              que já estão no seu dispositivo e pode configurar a maioria dos navegadores para impedir que 
              sejam adicionados. No entanto, se você fizer isso, talvez seja necessário ajustar manualmente 
              algumas preferências sempre que visitar um site e alguns serviços e funcionalidades podem não funcionar.
            </p>

            <h2>Contato</h2>
            <p>
              Se você tiver dúvidas sobre como usamos os cookies, entre em contato conosco.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CookiePolicy;

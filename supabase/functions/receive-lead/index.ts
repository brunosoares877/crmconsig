
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const body = await req.json()
    
    // Validar campos obrigatórios
    const { nome, telefone, origem, modalidade } = body
    
    if (!nome || !telefone || !origem || !modalidade) {
      return new Response(
        JSON.stringify({ 
          error: 'Campos obrigatórios: nome, telefone, origem, modalidade' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validar modalidade
    const modalidadesValidas = ['Aposentado', 'Bolsa Família', 'FGTS']
    if (!modalidadesValidas.includes(modalidade)) {
      return new Response(
        JSON.stringify({ 
          error: 'Modalidade deve ser: Aposentado, Bolsa Família ou FGTS' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Para este exemplo, vamos usar um user_id fixo
    // Em produção, isso deveria ser configurado de acordo com o cliente
    const defaultUserId = 'a2ed7ace-1702-4051-b1e2-f17540dc0b14' // Substitua pelo ID real

    // Inserir o lead na tabela leads_premium
    const { data, error } = await supabase
      .from('leads_premium')
      .insert({
        user_id: defaultUserId,
        nome: nome,
        telefone: telefone,
        mensagem: body.mensagem || '',
        origem: origem,
        modalidade: modalidade,
        status: 'Novo'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir lead:', error)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Se há mensagem, criar a mensagem inicial no chat
    if (body.mensagem) {
      await supabase
        .from('mensagens_premium')
        .insert({
          lead_id: data.id,
          user_id: defaultUserId,
          conteudo: body.mensagem,
          remetente: 'lead'
        })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: data.id,
        message: 'Lead recebido com sucesso!' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

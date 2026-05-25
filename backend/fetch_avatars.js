const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const INSTANCE_NAME = 'crm-principal';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getProfilePicture(phone) {
    try {
        // Try different phone formats
        let cleanNumber = phone.replace(/\D/g, ''); // Remove non-digits

        // If doesn't start with country code, assume Brazil
        if (!cleanNumber.startsWith('55')) {
            cleanNumber = '55' + cleanNumber;
        }

        console.log(`   📞 Tentando buscar foto para: ${cleanNumber}`);

        const response = await axios.post(
            `${EVOLUTION_API_URL}/chat/fetchProfilePicture/${INSTANCE_NAME}`,
            { number: cleanNumber },
            {
                headers: {
                    'apikey': EVOLUTION_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.profilePictureUrl) {
            return response.data.profilePictureUrl;
        }

        console.log(`   ℹ️  Resposta da API:`, response.data);
        return null;
    } catch (error) {
        if (error.response?.status === 404) {
            console.log(`   ⚠️  Perfil não encontrado (404)`);
        } else {
            console.error(`   ❌ Erro ao buscar foto:`, error.response?.data || error.message);
        }
        return null;
    }
}

async function updateMissingAvatars() {
    console.log('🔍 Buscando leads sem avatar_url...');

    // Buscar apenas 5 leads para teste
    const { data: leads, error } = await supabase
        .from('leads')
        .select('id, name, phone, avatar_url')
        .is('avatar_url', null)
        .not('phone', 'is', null)
        .limit(5);

    if (error) {
        console.error('Erro ao buscar leads:', error);
        return;
    }

    if (!leads || leads.length === 0) {
        console.log('✅ Todos os leads já têm avatar_url!');
        return;
    }

    console.log(`📋 Encontrados ${leads.length} leads sem foto. Buscando...`);

    let updated = 0;
    let failed = 0;

    for (const lead of leads) {
        console.log(`\n🔄 Processando: ${lead.name} (${lead.phone})`);

        const avatarUrl = await getProfilePicture(lead.phone);

        if (avatarUrl) {
            const { error: updateError } = await supabase
                .from('leads')
                .update({ avatar_url: avatarUrl })
                .eq('id', lead.id);

            if (updateError) {
                console.error(`   ❌ Erro ao atualizar ${lead.name}:`, updateError.message);
                failed++;
            } else {
                console.log(`   ✅ Foto atualizada para ${lead.name}`);
                updated++;
            }
        } else {
            console.log(`   ⚠️  Nenhuma foto disponível para ${lead.name}`);
            failed++;
        }

        // Delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n📊 Resumo:`);
    console.log(`   ✅ Atualizados: ${updated}`);
    console.log(`   ❌ Falhas: ${failed}`);
    console.log(`   📋 Total: ${leads.length}`);
}

// Executar
updateMissingAvatars()
    .then(() => {
        console.log('\n✅ Script finalizado!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n❌ Erro fatal:', err);
        process.exit(1);
    });

const supabase = require('../services/supabaseClient');
const fs = require('fs');
const path = require('path');

const handleWebhook = async (req, res) => {
    try {
        const logPath = 'c:\\Users\\Bruno\\.gemini\\antigravity\\scratch\\crmconsig\\backend\\webhook.log';
        fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${JSON.stringify(req.body)}\n`);

        const debugPath = 'c:\\Users\\Bruno\\.gemini\\antigravity\\scratch\\crmconsig\\backend\\webhook_debug.log';
        const logDebug = (msg) => fs.appendFileSync(debugPath, `[${new Date().toISOString()}] ${msg}\n`);

        logDebug('--- WEBHOOK HIT ---');
        const { event, data, instance } = req.body;
        const instanceName = instance || 'main';

        // 1. Handle Contact Updates (Profile Pictures, Names)
        if (event === 'contacts.upsert' || event === 'contacts.update') {
            const contactData = Array.isArray(data) ? data : [data];

            for (const contact of contactData) {
                const contactPhone = contact.id?.split('@')[0];
                if (!contactPhone) continue;

                const updatePayload = {};
                if (contact.profilePictureUrl) updatePayload.avatar_url = contact.profilePictureUrl;
                if (contact.pushName) updatePayload.name = contact.pushName;

                if (Object.keys(updatePayload).length > 0) {
                    logDebug(`Updating contact data for ${contactPhone}: ${JSON.stringify(updatePayload)}`);
                    const cleanPhone = contactPhone.replace(/\D/g, '');
                    const last8Digits = cleanPhone.slice(-8);

                    await supabase
                        .from('leads')
                        .update(updatePayload)
                        .or(`phone.ilike.%${last8Digits},phone2.ilike.%${last8Digits},phone3.ilike.%${last8Digits}`);
                }
            }
            return res.status(200).send('Contacts processed');
        }

        // 2. Handle Messages
        if (event !== 'messages.upsert') {
            logDebug(`Ignored event type: ${event}`);
            return res.status(200).send('Ignored event');
        }

        const messageData = data?.message || data;
        const messageType = messageData?.type || 'text';

        logDebug(`Processing message type: ${messageType}`);

        // Extract phone and content more robustly
        const remoteJid = data?.key?.remoteJid || data?.remoteJid;
        const fromMe = data?.key?.fromMe || false;

        if (!remoteJid) {
            logDebug('No remoteJid found in payload');
            return res.status(400).send('No remoteJid found');
        }

        const phone = remoteJid.split('@')[0];

        // SUPPORT MULTIPLE MESSAGE TYPES (Evolution API v2 structure)
        const msg = data?.message || data;
        let content = "";

        if (msg.conversation) {
            content = msg.conversation;
        } else if (msg.extendedTextMessage?.text) {
            content = msg.extendedTextMessage.text;
        } else if (msg.text?.body) {
            content = msg.text.body;
        } else if (msg.imageMessage) {
            content = msg.imageMessage.caption ? `[Imagem] ${msg.imageMessage.caption}` : "[Imagem]";
        } else if (msg.videoMessage) {
            content = msg.videoMessage.caption ? `[Vídeo] ${msg.videoMessage.caption}` : "[Vídeo]";
        } else if (msg.audioMessage || msg.voiceMessage) {
            content = msg.voiceMessage ? "[Áudio / Voz]" : "[Áudio]";
        } else if (msg.documentMessage) {
            content = msg.documentMessage.caption ? `[Documento] ${msg.documentMessage.caption}` : "[Documento]";
            if (!content && msg.documentMessage.fileName) content = `[Documento] ${msg.documentMessage.fileName}`;
        } else if (msg.stickerMessage) {
            content = "[Figurinha]";
        } else if (msg.locationMessage) {
            content = "[Localização]";
        } else if (msg.viewOnceMessageV2?.message?.imageMessage) {
            content = "[Imagem (Visualização Única)]";
        } else if (msg.viewOnceMessageV2?.message?.videoMessage) {
            content = "[Vídeo (Visualização Única)]";
        } else {
            // Log structure for debugging if unknown
            logDebug(`Unknown message structure: ${JSON.stringify(Object.keys(msg))}`);
            content = "[Mensagem de Mídia]"; // Fallback for any media
        }

        console.log(`Received ${fromMe ? 'OUTBOUND' : 'INBOUND'} message from ${phone}: ${content}`);

        const cleanIncoming = phone.replace(/\D/g, '');
        const last8 = cleanIncoming.slice(-8);

        logDebug(`Searching/Upserting lead for phone ${phone}`);

        let leadId = null;

        // Try to find existing lead
        const { data: matchedLeads } = await supabase
            .from('leads')
            .select('id, name, status, avatar_url')
            .or(`phone.ilike.%${last8},phone2.ilike.%${last8},phone3.ilike.%${last8}`)
            .limit(1);

        if (matchedLeads && matchedLeads.length > 0) {
            leadId = matchedLeads[0].id;
            logDebug(`Lead found: ${matchedLeads[0].name} (${leadId})`);

            if (matchedLeads[0].status === 'novo') {
                await supabase.from('leads').update({ status: 'contatado' }).eq('id', leadId);
            }

            // Check if we need to fetch profile picture (if missing)
            if (!matchedLeads[0].avatar_url) {
                const { getProfilePicture } = require('../services/evolutionService');
                getProfilePicture(instanceName, phone).then(url => {
                    if (url) {
                        logDebug(`Fetched profile picture for existing lead ${phone}: ${url}`);
                        supabase.from('leads').update({ avatar_url: url }).eq('id', leadId).then(() => { });
                    }
                });
            }
        } else {
            // New Lead detected
            logDebug(`New Lead detected: ${phone}. Upserting...`);

            const fallbackUserId = 'a2ed7ace-1702-4051-b1e2-f17540dc0b14';

            // Initial data
            const leadData = {
                name: data.pushName || `Cliente WhatsApp ${phone.slice(-4)}`,
                phone: phone,
                status: 'novo',
                source: 'whatsapp',
                user_id: fallbackUserId
            };

            // Attempt to fetch profile picture immediately for new lead
            const { getProfilePicture } = require('../services/evolutionService');
            try {
                const avatarUrl = await getProfilePicture(instanceName, phone);
                if (avatarUrl) {
                    leadData.avatar_url = avatarUrl;
                    logDebug(`Fetched profile picture for new lead ${phone}: ${avatarUrl}`);
                }
            } catch (e) {
                logDebug(`Failed to fetch profile picture for new lead: ${e.message}`);
            }

            // Use INSERT instead of UPSERT since phone doesn't have unique constraint
            const { data: newLead, error: insertError } = await supabase
                .from('leads')
                .insert([leadData])
                .select()
                .single();

            if (insertError) {
                logDebug(`Error inserting lead: ${JSON.stringify(insertError)}`);
                // Try to find if it was created anyway
                const { data: retryData } = await supabase
                    .from('leads')
                    .select('id')
                    .eq('phone', phone)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();
                if (retryData) leadId = retryData.id;
            } else {
                leadId = newLead?.id;
                logDebug(`Successfully created new lead: ${leadId}`);
            }
        }

        if (leadId) {
            const { error: msgError } = await supabase
                .from('lead_messages')
                .insert([{
                    lead_id: leadId,
                    content: content,
                    direction: fromMe ? 'outbound' : 'inbound',
                    message_type: 'whatsapp',
                    metadata: data
                }]);

            if (msgError) logDebug(`Error saving message: ${JSON.stringify(msgError)}`);
            else logDebug(`Saved message for Lead ${leadId}`);
        }

        res.status(200).send('Webhook processed');

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { handleWebhook };

require('dotenv').config();
const localtunnel = require('localtunnel');
const evolutionApi = require('./utils/evolutionApi');

const PORT = 3001;
const INSTANCE_NAME = 'crm-principal';

(async () => {
    const tunnel = await localtunnel({ port: PORT });

    console.log(`Tunnel running at: ${tunnel.url}`);

    const webhookUrl = `${tunnel.url}/webhook/whatsapp`;

    console.log(`Updating webhook to: ${webhookUrl}`);

    try {
        const result = await evolutionApi.setWebhook(
            INSTANCE_NAME,
            webhookUrl,
            false,
            ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'SEND_MESSAGE']
        );
        console.log('Webhook updated successfully:', result);
    } catch (err) {
        console.error('Failed to update webhook:', err);
    }

    tunnel.on('close', () => {
        console.log('Tunnel closed');
    });
})();

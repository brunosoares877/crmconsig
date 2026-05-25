const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const evolutionApi = require('./utils/evolutionApi');

const INSTANCE_NAME = 'crm-principal';
// Using host.docker.internal to reach the Windows host from inside Docker
const WEBHOOK_URL = 'http://host.docker.internal:3001/webhook/whatsapp';

const configureWebhook = async () => {
    try {
        console.log(`Setting webhook for ${INSTANCE_NAME} to ${WEBHOOK_URL}...`);
        const result = await evolutionApi.setWebhook(
            INSTANCE_NAME,
            WEBHOOK_URL,
            false,
            ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'SEND_MESSAGE']
        );
        console.log('Webhook configured successfully:', result);
    } catch (error) {
        console.error('Failed to configure webhook:', error);
    }
};

configureWebhook();

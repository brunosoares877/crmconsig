const axios = require('axios');

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

const api = axios.create({
    baseURL: EVOLUTION_API_URL,
    headers: {
        'apikey': EVOLUTION_API_KEY,
        'Content-Type': 'application/json'
    }
});

/**
 * Sends a text message to a specific number
 * @param {string} instance - The instance name
 * @param {string} number - The phone number (remoteJid format preferred, e.g., 5511999999999)
 * @param {string} text - The message text
 */
const sendMessage = async (instance, number, text) => {
    try {
        const response = await api.post(`/message/sendText/${instance}`, {
            number: number,
            text: text, // Try simple text field first (Evolution v2 sometimes accepts this shortcut)
            // textMessage: { text: text } // Fallback if simple text fails
        });
        return response.data;
    } catch (error) {
        console.error('Error sending message (Evolution):', JSON.stringify(error.response?.data || error.message, null, 2));
        throw error;
    }
};

/**
 * Sends media (image, audio, video, document) to a specific number
 * @param {string} instance - The instance name
 * @param {string} number - The phone number
 * @param {string} media - Base64 encoded media or URL
 * @param {string} fileName - File name
 * @param {string} caption - Optional caption
 * @param {string} type - Media type (image, audio, video, document)
 */
const sendMedia = async (instance, number, media, fileName, caption = '', type = 'image') => {
    try {
        let payload = {
            number: number,
            mediatype: type.toLowerCase(),
            media: media,
            fileName: fileName || `file.${type}`
        };

        if (caption && (type === 'image' || type === 'video')) {
            payload.caption = caption;
        }

        const response = await api.post(`/message/sendMedia/${instance}`, payload);
        return response.data;
    } catch (error) {
        console.error('Error sending media (Evolution):', JSON.stringify(error.response?.data || error.message, null, 2));
        throw error;
    }
};

/**
 * Create a new instance
 * @param {string} instanceName 
 */
const createInstance = async (instanceName) => {
    try {
        const response = await api.post('/instance/create', {
            instanceName: instanceName,
            token: "",
            qrcode: true,
            integration: "WHATSAPP-BAILEYS"
        });
        return response.data;
    } catch (error) {
        console.error('Error creating instance:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Connect instance (Generate QR Code)
 * @param {string} instanceName 
 */
const connectInstance = async (instanceName) => {
    try {
        const response = await api.get(`/instance/connect/${instanceName}`);
        return response.data;
    } catch (error) {
        console.error('Error connecting instance:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Delete an instance
 * @param {string} instanceName 
 */
const deleteInstance = async (instanceName) => {
    try {
        const response = await api.delete(`/instance/delete/${instanceName}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting instance:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Logout an instance
 * @param {string} instanceName 
 */
const logoutInstance = async (instanceName) => {
    try {
        const response = await api.delete(`/instance/logout/${instanceName}`);
        return response.data;
    } catch (error) {
        // Ignore error if not logged in
        console.log('Logout failed (might not be logged in):', error.response?.data || error.message);
        return null;
    }
}
/**
 * Get instance connection state
 * @param {string} instanceName 
 */
const connectionState = async (instanceName) => {
    try {
        const response = await api.get(`/instance/connectionState/${instanceName}`);
        return response.data;
    } catch (error) {
        console.error('Error getting connection state:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Set Webhook for instance
 * @param {string} instanceName 
 * @param {string} webhookUrl 
 * @param {boolean} webhookByEvents 
 * @param {Array} events 
 */
const setWebhook = async (instanceName, webhookUrl, webhookByEvents = false, events = []) => {
    try {
        const response = await api.post(`/webhook/set/${instanceName}`, {
            "webhook": {
                "url": webhookUrl,
                "byEvents": false, // Set false to receive all or true for specific
                "events": events.length > 0 ? events : ["MESSAGES_UPSERT", "MESSAGES_UPDATE"],
                "enabled": true
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error setting webhook:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    sendMessage,
    sendMedia,
    createInstance,
    connectInstance,
    deleteInstance,
    logoutInstance,
    connectionState,
    setWebhook
};

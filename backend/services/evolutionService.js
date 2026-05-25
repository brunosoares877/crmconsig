const axios = require('axios');
require('dotenv').config();

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

/**
 * Fetches the profile picture URL for a given WhatsApp number.
 * @param {string} instanceName - The Evolution API instance name.
 * @param {string} number - The WhatsApp number (JID).
 * @returns {Promise<string|null>} - The profile picture URL or null.
 */
async function getProfilePicture(instanceName, number) {
    try {
        if (!EVOLUTION_API_KEY) {
            console.error('[EvolutionService] Missing API Key');
            return null;
        }

        // Standardizing number for lookup: ensure it doesn't have @s.whatsapp.net if passed raw
        const cleanNumber = number.split('@')[0];

        const response = await axios.post(`${EVOLUTION_API_URL}/chat/fetchProfilePicture/${instanceName}`, {
            number: cleanNumber
        }, {
            headers: {
                'apikey': EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        // Evolution API v2 returns { profilePictureUrl: "..." }
        if (response.data && response.data.profilePictureUrl) {
            return response.data.profilePictureUrl;
        }

        return null;
    } catch (error) {
        console.error(`[EvolutionService] Error fetching profile picture for ${number}:`, error.message);
        return null;
    }
}

/**
 * Fetches media content from Evolution API (decrypts .enc files).
 * @param {string} instanceName - The Evolution API instance name.
 * @param {string} messageId - The message ID containing the media.
 * @returns {Promise<{base64: string, mimetype: string}|null>} - The media data or null.
 */
async function fetchMedia(instanceName, messageId) {
    try {
        if (!EVOLUTION_API_KEY) {
            console.error('[EvolutionService] Missing API Key');
            return null;
        }

        console.log(`[EvolutionService] Fetching media for instance: ${instanceName}, messageId: ${messageId}`);

        // Evolution API endpoint to get base64 from media message
        const url = `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${instanceName}`;

        console.log(`[EvolutionService] Calling URL: ${url}`);

        const response = await axios.post(url, {
            message: {
                key: {
                    id: messageId
                }
            },
            convertToMp4: false
        }, {
            headers: {
                'apikey': EVOLUTION_API_KEY,
                'Content-Type': 'application/json'
            }
        });

        console.log(`[EvolutionService] Response status: ${response.status}`);
        console.log(`[EvolutionService] Response data keys:`, Object.keys(response.data || {}));

        // Evolution API returns { base64: "...", mimetype: "..." }
        if (response.data && response.data.base64) {
            console.log(`[EvolutionService] Successfully fetched media, mimetype: ${response.data.mimetype}`);
            return {
                base64: response.data.base64,
                mimetype: response.data.mimetype || 'application/octet-stream'
            };
        }

        console.log('[EvolutionService] No base64 data in response');
        return null;
    } catch (error) {
        console.error(`[EvolutionService] Error fetching media for ${messageId}:`, error.message);
        if (error.response) {
            console.error(`[EvolutionService] Response status: ${error.response.status}`);
            console.error(`[EvolutionService] Response data:`, error.response.data);
        }
        return null;
    }
}

module.exports = {
    getProfilePicture,
    fetchMedia
};

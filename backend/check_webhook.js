const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');

const INSTANCE = 'crm-principal';
const API_URL = process.env.EVOLUTION_API_URL;
const API_KEY = process.env.EVOLUTION_API_KEY;

const checkWebhook = async () => {
    try {
        const response = await axios.get(`${API_URL}/webhook/find/${INSTANCE}`, {
            headers: { 'apikey': API_KEY }
        });
        console.log('RAW DATA:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error checking webhook:', error.response?.data || error.message);
    }
};

checkWebhook();

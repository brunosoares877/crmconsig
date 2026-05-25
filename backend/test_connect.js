const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';

async function test() {
    try {
        console.log('Testing Evolution API Connect...');

        // Connect Instance
        console.log('\nConnecting instance crm-principal...');
        const connectRes = await axios.get(`${API_URL}/instance/connect/crm-principal`, {
            headers: { 'apikey': API_KEY }
        });
        console.log('Connect Result:', JSON.stringify(connectRes.data, null, 2));

    } catch (error) {
        console.error('Connect Error:', error.response?.data || error.message);
    }
}

test();

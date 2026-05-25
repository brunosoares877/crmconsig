const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';

async function test() {
    try {
        console.log('Checking instances...');
        const res = await axios.get(`${API_URL}/instance/fetchInstances`, {
            headers: { 'apikey': API_KEY }
        });
        console.log('Instances:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

test();

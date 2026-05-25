const axios = require('axios');

const API_URL = 'http://localhost:8080';
const API_KEY = '429683C4C977415CAAFCCE10F7D57E11';

async function deleteInstance() {
    try {
        console.log('Deleting instance crm-principal...');
        const res = await axios.delete(`${API_URL}/instance/delete/crm-principal`, {
            headers: { 'apikey': API_KEY }
        });
        console.log('Delete Result:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

deleteInstance();

require('dotenv').config();
const evolutionApi = require('./utils/evolutionApi');

const INSTANCE = 'crm-principal';

const checkState = async () => {
    try {
        console.log(`Checking state for ${INSTANCE}...`);
        const state = await evolutionApi.connectionState(INSTANCE);
        console.log('Connection State:', JSON.stringify(state, null, 2));
    } catch (error) {
        console.error('Error checking state:', error.message);
    }
};

checkState();

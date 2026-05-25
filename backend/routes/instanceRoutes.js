const express = require('express');
const router = express.Router();
const evolutionApi = require('../utils/evolutionApi');

// Create Instance
router.post('/create', async (req, res) => {
    try {
        const { instanceName } = req.body;
        if (!instanceName) {
            return res.status(400).json({ error: 'Instance Name is required' });
        }
        const result = await evolutionApi.createInstance(instanceName);
        res.json(result);
    } catch (error) {
        // Se a instância já existir (Erro 403), deleta e cria novamente para garantir o QR Code
        if (error.response && error.response.status === 403) {
            console.log(`Instance ${req.body.instanceName} already exists. Cleaning up...`);
            try {
                await evolutionApi.logoutInstance(req.body.instanceName);
                await evolutionApi.deleteInstance(req.body.instanceName);

                // Wait 5 seconds for full cleanup
                await new Promise(resolve => setTimeout(resolve, 5000));

                console.log('Recreating instance...');
                const result = await evolutionApi.createInstance(req.body.instanceName);
                console.log('Recreation Result:', JSON.stringify(result, null, 2));
                return res.json(result);
            } catch (retryError) {
                console.error('Failed to recreate instance:', retryError.message);
                return res.status(500).json({ error: 'Failed to recreate instance' });
            }
        }
        res.status(500).json({ error: 'Failed to create instance' });
    }
});

// Connect Instance (Get QR Code)
router.get('/connect/:instance', async (req, res) => {
    try {
        const { instance } = req.params;
        const result = await evolutionApi.connectInstance(instance);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to connect instance' });
    }
});

// Get Connection Status
router.get('/status/:instance', async (req, res) => {
    try {
        const { instance } = req.params;
        const result = await evolutionApi.connectionState(instance);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get status' });
    }
});

module.exports = router;

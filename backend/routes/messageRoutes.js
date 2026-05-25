const express = require('express');
const router = express.Router();
const evolutionApi = require('../utils/evolutionApi');
const supabase = require('../services/supabaseClient');
const evolutionService = require('../services/evolutionService');

// Send Message
router.post('/send', async (req, res) => {
    try {
        const { instanceName, number, text, leadId } = req.body;

        if (!instanceName || !number || !text) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Sanitize phone number (remove non-digits)
        let cleanNumber = number.replace(/\D/g, '');

        // Basic formatting for Brazil (if length is 10 or 11, assume BR and add 55)
        if (cleanNumber.length >= 10 && cleanNumber.length <= 11) {
            cleanNumber = '55' + cleanNumber;
        }

        const isInternal = req.body.isInternalNote === true;
        let result = { status: 'saved_internal_note' };

        // 1. Send via Evolution API (ONLY if NOT internal note)
        if (!isInternal) {
            result = await evolutionApi.sendMessage(instanceName, cleanNumber, text);
        }

        let savedMsg = null;
        if (leadId) {
            const { data, error: dbError } = await supabase
                .from('lead_messages')
                .insert([
                    {
                        lead_id: leadId,
                        content: text,
                        direction: 'outbound',
                        status: 'sent',
                        message_type: 'text',
                        is_internal_note: isInternal
                    }
                ])
                .select()
                .single();

            if (dbError) {
                console.error('Failed to save message:', dbError);
            } else {
                savedMsg = data;
            }
        }

        res.json({ ...result, savedMsg });
    } catch (error) {
        // Detailed error logging
        const errorDetails = error.response?.data || error.message;
        console.error('Send message error:', JSON.stringify(errorDetails, null, 2));
        res.status(500).json({ error: 'Failed to send message', details: errorDetails });
    }
});

// Send Media
router.post('/send-media', async (req, res) => {
    try {
        const { instanceName, number, media, fileName, caption, type, leadId } = req.body;

        if (!instanceName || !number || !media) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.length >= 10 && cleanNumber.length <= 11) {
            cleanNumber = '55' + cleanNumber;
        }

        // 1. Send via Evolution API
        const result = await evolutionApi.sendMedia(instanceName, cleanNumber, media, fileName, caption, type);

        let savedMsg = null;
        if (leadId) {
            const { data, error: dbError } = await supabase
                .from('lead_messages')
                .insert([
                    {
                        lead_id: leadId,
                        content: caption || `[Arquivo: ${fileName || type}]`,
                        direction: 'outbound',
                        status: 'sent',
                        message_type: 'whatsapp',
                        metadata: { fileName, type, caption }
                    }
                ])
                .select()
                .single();

            if (dbError) console.error('Failed to save media message:', dbError);
            else savedMsg = data;
        }

        res.json({ ...result, savedMsg });
    } catch (error) {
        const errorDetails = error.response?.data || error.message;
        console.error('Send media error:', JSON.stringify(errorDetails, null, 2));
        res.status(500).json({ error: 'Failed to send media', details: errorDetails });
    }
});

// Media Proxy - Fetch and decrypt media from Evolution API
router.get('/media-proxy', async (req, res) => {
    try {
        const { instanceName, messageId } = req.query;

        console.log('[Media Proxy] Request received:', { instanceName, messageId });

        if (!instanceName || !messageId) {
            console.log('[Media Proxy] Missing parameters');
            return res.status(400).json({ error: 'Missing instanceName or messageId' });
        }

        console.log('[Media Proxy] Calling evolutionService.fetchMedia...');
        const mediaData = await evolutionService.fetchMedia(instanceName, messageId);

        if (!mediaData) {
            console.log('[Media Proxy] No media data returned from Evolution API');
            return res.status(404).json({ error: 'Media not found or could not be decrypted' });
        }

        console.log('[Media Proxy] Media fetched successfully, mimetype:', mediaData.mimetype);

        // Convert base64 to buffer
        const buffer = Buffer.from(mediaData.base64, 'base64');

        // Set appropriate headers
        res.set('Content-Type', mediaData.mimetype);
        res.set('Content-Length', buffer.length);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

        console.log('[Media Proxy] Sending media, size:', buffer.length);

        // Send binary data
        res.send(buffer);
    } catch (error) {
        console.error('[Media Proxy] Error:', error.message);
        console.error('[Media Proxy] Stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch media', details: error.message });
    }
});

// Media Proxy - Fetch and decrypt media from Evolution API
router.get('/media-proxy', async (req, res) => {
    try {
        const { instanceName, messageId } = req.query;

        console.log('[Media Proxy] Request received:', { instanceName, messageId });

        if (!instanceName || !messageId) {
            console.log('[Media Proxy] Missing parameters');
            return res.status(400).json({ error: 'Missing instanceName or messageId' });
        }

        console.log('[Media Proxy] Calling evolutionService.fetchMedia...');
        const mediaData = await evolutionService.fetchMedia(instanceName, messageId);

        if (!mediaData) {
            console.log('[Media Proxy] No media data returned from Evolution API');
            return res.status(404).json({ error: 'Media not found or could not be decrypted' });
        }

        console.log('[Media Proxy] Media fetched successfully, mimetype:', mediaData.mimetype);

        // Convert base64 to buffer
        const buffer = Buffer.from(mediaData.base64, 'base64');

        // Set appropriate headers
        res.set('Content-Type', mediaData.mimetype);
        res.set('Content-Length', buffer.length);
        res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

        console.log('[Media Proxy] Sending media, size:', buffer.length);

        // Send binary data
        res.send(buffer);
    } catch (error) {
        console.error('[Media Proxy] Error:', error.message);
        console.error('[Media Proxy] Stack:', error.stack);
        res.status(500).json({ error: 'Failed to fetch media', details: error.message });
    }
});

module.exports = router;

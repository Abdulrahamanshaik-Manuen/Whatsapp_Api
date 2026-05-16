import axios from 'axios';

const META_API_URL = 'https://graph.facebook.com/v21.0';

/**
 * Submit a template to Meta WhatsApp Cloud API
 * @param {string} wabaId - WhatsApp Business Account ID
 * @param {string} accessToken - Meta System User Access Token
 * @param {object} templateData - Template details (name, category, language, content, variables)
 */
export const submitTemplateToMeta = async (wabaId, accessToken, templateData) => {
    try {
        const { name, category, language, content } = templateData;

        const url = `${META_API_URL}/${wabaId}/message_templates`;
        
        const body = {
            name,
            category,
            language,
            components: [
                {
                    type: 'BODY',
                    text: content
                }
            ]
        };

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

/**
 * Get Template Status from Meta
 */
export const getTemplateStatusFromMeta = async (wabaId, accessToken, templateName) => {
    try {
        const url = `${META_API_URL}/${wabaId}/message_templates?name=${templateName}`;
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const template = response.data.data?.[0];
        if (!template) {
            return { success: false, error: 'Template not found on Meta' };
        }

        return {
            success: true,
            status: template.status, // PENDING, APPROVED, REJECTED
            id: template.id
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

/**
 * Send a Template Message
 */
export const sendTemplateMessage = async (phone_number_id, accessToken, to, templateName, languageCode = 'en_US', variables = [], headerImage = null) => {
    try {
        const url = `${META_API_URL}/${phone_number_id}/messages`;
        
        // Ensure number has '+' prefix as seen in Meta Dashboard
        const formattedTo = to.startsWith('+') ? to : `+${to}`;

        const body = {
            messaging_product: "whatsapp",
            to: formattedTo,
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
                components: []
            }
        };

        // Handle Image Header
        if (headerImage) {
            body.template.components.push({
                type: 'header',
                parameters: [
                    {
                        type: 'image',
                        image: { link: headerImage }
                    }
                ]
            });
        }

        // Handle Body Variables
        if (variables && variables.length > 0) {
            body.template.components.push({
                type: 'body',
                parameters: variables.map(val => ({
                    type: 'text',
                    text: (val === null || val === undefined || val === '') ? ' ' : String(val)
                }))
            });
        }

        // If no components, remove the array to keep payload minimal
        if (body.template.components.length === 0) {
            delete body.template.components;
        }


        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

export const sendTextMessage = async (phone_number_id, accessToken, to, text) => {
    try {
        const url = `${META_API_URL}/${phone_number_id}/messages`;
        
        const body = {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: text }
        };

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

/**
 * Send a Media Message (Image, Document, Video, Audio)
 */
export const sendMediaMessage = async (phone_number_id, accessToken, to, type, mediaUrl, caption = '') => {
    try {
        const url = `${META_API_URL}/${phone_number_id}/messages`;
        
        // Ensure number has '+' prefix
        const formattedTo = to.startsWith('+') ? to : `+${to}`;

        const body = {
            messaging_product: "whatsapp",
            to: formattedTo,
            type: type,
            [type]: {
                link: mediaUrl
            }
        };

        // Add caption only if it's an image or video
        if (caption && (type === 'image' || type === 'video')) {
            body[type].caption = caption;
        }
        
        // Documents can have a filename
        if (type === 'document' && caption) {
            body[type].filename = caption;
        }

        const response = await axios.post(url, body, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

export const getAllTemplatesFromMeta = async (wabaId, accessToken) => {
    try {
        const url = `${META_API_URL}/${wabaId}/message_templates`;
        
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        return {
            success: true,
            data: response.data.data // The array of templates
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

/**
 * Upload a media sample to Meta to get a handle (h)
 */
export const uploadMediaSampleToMeta = async (appId, accessToken, fileBuffer, fileName, fileType) => {
    try {
        // 1. Create upload session
        const sessionUrl = `https://graph.facebook.com/v17.0/${appId}/uploads`;
        const sessionResponse = await axios.post(sessionUrl, null, {
            params: {
                file_name: fileName,
                file_length: fileBuffer.length,
                file_type: fileType,
                access_token: accessToken
            }
        });

        const uploadSessionId = sessionResponse.data.id;

        // 2. Upload file content
        const uploadUrl = `https://graph.facebook.com/v17.0/${uploadSessionId}`;
        const uploadResponse = await axios.post(uploadUrl, fileBuffer, {
            headers: {
                'Authorization': `OAuth ${accessToken}`,
                'file_offset': 0,
                'Content-Type': 'application/octet-stream'
            }
        });

        return {
            success: true,
            handle: uploadResponse.data.h
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

/**
 * Get the actual URL for a media handle (file ID)
 */
export const getMediaUrl = async (mediaId, accessToken) => {
    try {
        const url = `${META_API_URL}/${mediaId}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` },
            params: { fields: 'url' }
        });
        return response.data.url;
    } catch (error) {
        return null;
    }
};

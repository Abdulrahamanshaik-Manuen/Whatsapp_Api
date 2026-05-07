import axios from 'axios';

const META_API_URL = 'https://graph.facebook.com/v17.0';

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
        console.error('Meta Template Submission Error:', error.response?.data || error.message);
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
        console.error('Meta Template Status Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

/**
 * Send a Template Message
 * @param {string} phone_number_id - Meta Phone Number ID
 * @param {string} accessToken - Access Token
 * @param {string} to - Recipient phone number
 * @param {string} templateName - Name of the template
 * @param {string} languageCode - Language code (e.g., en_US)
 * @param {Array} variables - Array of variable values
 */
export const sendTemplateMessage = async (phone_number_id, accessToken, to, templateName, languageCode = 'en_US', variables = []) => {
    try {
        const url = `${META_API_URL}/${phone_number_id}/messages`;
        
        const body = {
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
                name: templateName,
                language: { code: languageCode },
                components: []
            }
        };

        if (variables && variables.length > 0) {
            body.template.components.push({
                type: 'body',
                parameters: variables.map(val => ({
                    type: 'text',
                    text: String(val)
                }))
            });
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
        console.error('Meta Send Template Message Error:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data?.error?.message || error.message
        };
    }
};

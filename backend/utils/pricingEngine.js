/**
 * Meta WhatsApp Pricing Engine (India focus)
 *
 * Pricing Logic (as per user requirements):
 * - Marketing Template: ALWAYS 0.8631
 * - Authentication Template: ALWAYS 0.1150
 * - Utility Template:
 *    - Inside active window: FREE (0)
 *    - Outside window: 0.1150
 * - Non-Template (Text/Media):
 *    - Inside active window: FREE (0)
 *    - Outside window: NOT ALLOWED (Cost infinity/Error)
 */

const PRICING_CONFIG = {
    marketing: 0.8631,
    utility: 0.1150,
    authentication: 0.1150,
    service: 0
};

/**
 * Calculate Meta Cost for a message
 * @param {Object} params
 * @param {string} params.category - 'marketing', 'utility', 'authentication', or 'text'
 * @param {boolean} params.isInsideWindow - Whether the 24h customer service window is active
 * @returns {number} - Calculated Meta cost
 */
export const calculateMetaCost = ({ category, isInsideWindow }) => {
    // 1. Marketing and Authentication are always charged
    if (category === 'marketing') return PRICING_CONFIG.marketing;
    if (category === 'authentication') return PRICING_CONFIG.authentication;

    // 2. Utility logic
    if (category === 'utility') {
        return isInsideWindow ? 0 : PRICING_CONFIG.utility;
    }

    // 3. Non-template messages (text, image, etc.)
    if (!category || category === 'text' || category === 'media') {
        if (isInsideWindow) {
            return 0; // FREE
        } else {
            // Should be blocked by controller, but return high cost or flag
            return -1; // Flag as blocked/invalid
        }
    }

    return 0; // Default fallback
};

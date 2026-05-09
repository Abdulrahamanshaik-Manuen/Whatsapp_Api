import Automation from '../models/Automation.js';
import axios from 'axios';

export const processAutomation = async (userId, fromNumber, messageText) => {
  try {
    // 1. Find all active automations for this user
    const automations = await Automation.find({ user: userId, status: 'active' });

    for (const auto of automations) {
      let triggered = false;

      // 2. Check Triggers
      if (auto.trigger.event === 'incoming_message') {
        triggered = true;
      } else if (auto.trigger.event === 'keyword_match') {
        const matches = auto.trigger.keywords.some(kw => {
          if (auto.trigger.matchType === 'exact') {
            return messageText.trim().toLowerCase() === kw.toLowerCase();
          } else {
            return messageText.toLowerCase().includes(kw.toLowerCase());
          }
        });
        if (matches) triggered = true;
      }

      if (triggered) {
        console.log(`Automation "${auto.name}" triggered for ${fromNumber}`);
        
        const responseText = auto.action.content;

        // 3. Send Message via WhatsApp API
        if (responseText) {
          await sendWhatsAppMessage(userId, fromNumber, responseText);
          
          // 4. Update Metrics
          auto.metrics.sentCount += 1;
          auto.metrics.lastTriggered = new Date();
          await auto.save();
        }
        
        // Stop after first matching automation to prevent loops (optional logic)
        break; 
      }
    }
  } catch (err) {
    console.error("Automation Process Error:", err);
  }
};

const sendWhatsAppMessage = async (userId, to, text) => {
  try {
    // We need phone_number_id and access_token from User model
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(userId);
    
    if (!user || !user.phone_number_id || !user.access_token) {
      console.error(`User ${userId} has missing WhatsApp credentials.`);
      return;
    }

    const url = `https://graph.facebook.com/v22.0/${user.phone_number_id}/messages`;
    const token = user.access_token;

    await axios.post(url, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: { body: text }
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log(`Automation response sent to ${to}`);
  } catch (err) {
    console.error("WhatsApp Send Error in Automation:", err.response?.data || err.message);
  }
};

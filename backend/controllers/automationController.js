import Automation from '../models/Automation.js';

export const getAutomations = async (req, res) => {
  try {
    const automations = await Automation.find({ user: req.user.id, isTemplate: false }).sort({ createdAt: -1 });
    res.json(automations);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

export const getGlobalTemplates = async (req, res) => {
  try {
    const templates = await Automation.find({ isTemplate: true }).sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

export const createAutomation = async (req, res) => {
  try {
    const newAutomation = new Automation({
      ...req.body,
      user: req.user.id,
      isTemplate: false
    });
    const saved = await newAutomation.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Validation Error', error: err.message });
  }
};

export const createGlobalTemplate = async (req, res) => {
  try {
    // Check if user is admin (assuming req.user.role exists)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create templates' });
    }
    const newTemplate = new Automation({
      ...req.body,
      user: req.user.id,
      isTemplate: true
    });
    const saved = await newTemplate.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Validation Error', error: err.message });
  }
};

export const cloneAutomation = async (req, res) => {
  try {
    const { id } = req.params; // Template ID
    const userId = req.user.id;

    // Check if user already has this template installed
    const existing = await Automation.findOne({ user: userId, originalTemplateId: id });
    if (existing) {
      return res.status(400).json({ message: 'Template already installed!' });
    }

    const template = await Automation.findById(id);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    const clonedData = {
      user: userId,
      name: template.name,
      type: template.type,
      trigger: template.trigger,
      action: template.action,
      originalTemplateId: template._id,
      status: 'draft',
      isTemplate: false,
      category: template.category
    };

    const newClone = new Automation(clonedData);
    await newClone.save();

    res.status(201).json(newClone);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

export const seedTemplates = async (req, res) => {
  try {
    const templates = [
      {
        name: 'Welcome Greeting',
        type: 'auto-reply',
        trigger: { event: 'incoming_message' },
        action: { messageType: 'text', content: 'Hello! 👋 Thank you for contacting us. How can we help you today?' },
        isTemplate: true,
        category: 'Customer Service'
      },
      {
        name: 'Out of Office',
        type: 'auto-reply',
        trigger: { event: 'incoming_message' },
        action: { messageType: 'text', content: 'We are currently away, but we will get back to you as soon as possible! 🕒' },
        isTemplate: true,
        category: 'Utility'
      },
      {
        name: 'Product Catalog Request',
        type: 'keyword',
        trigger: { event: 'keyword_match', keywords: ['catalog', 'price', 'menu'], matchType: 'contains' },
        action: { messageType: 'text', content: 'Here is our latest catalog! 📚 [Link to Catalog]' },
        isTemplate: true,
        category: 'Sales'
      },
      {
        name: 'Appointment Booking',
        type: 'keyword',
        trigger: { event: 'keyword_match', keywords: ['book', 'appointment', 'schedule'], matchType: 'contains' },
        action: { messageType: 'text', content: 'Great! You can book your appointment here: [Link]' },
        isTemplate: true,
        category: 'Sales'
      }
    ];

    // Filter out templates that already exist
    const finalTemplates = [];
    for (const t of templates) {
      const exists = await Automation.findOne({ name: t.name, isTemplate: true });
      if (!exists) finalTemplates.push(t);
    }

    if (finalTemplates.length > 0) {
      await Automation.insertMany(finalTemplates);
      res.json({ message: `${finalTemplates.length} new templates seeded!` });
    } else {
      res.json({ message: 'No new templates needed - library is up to date!' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

export const updateAutomationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const automation = await Automation.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { status },
      { new: true }
    );
    if (!automation) return res.status(404).json({ message: 'Automation not found' });
    res.json(automation);
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

export const deleteAutomation = async (req, res) => {
  try {
    const automation = await Automation.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!automation) return res.status(404).json({ message: 'Automation not found' });
    res.json({ message: 'Automation removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

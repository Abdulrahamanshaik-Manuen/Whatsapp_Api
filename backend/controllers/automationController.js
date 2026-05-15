import Automation from '../models/Automation.js';

export const getAutomations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query = {
        $or: [
          { clientId: req.user.user_id },
          { createdBy: req.user.user_id }
        ]
      };
    }

    const automations = await Automation.find(query).sort({ createdAt: -1 });

    res.json(automations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAutomation = async (req, res) => {
  try {
    const userRole = (req.user.role || '').toLowerCase();
    console.log('[Automation] Create Request:', { role: req.user.role, userRole, bodyStatus: status });
    
    // If client is creating, enforce status = requested
    // If admin is creating, respect body or default to active
    let finalStatus = (status || 'active');
    if (userRole === 'client') {
        finalStatus = 'requested';
    }
    const finalClientId = req.user.role === 'client' ? req.user.user_id : (clientId || null);
    console.log('[Automation] Final Data:', { finalStatus, finalClientId });

    const automation = await Automation.create({
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      status: finalStatus,
      createdBy: req.user.user_id,
      clientId: finalClientId
    });

    res.status(201).json(automation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAutomationById = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });

    res.json(automation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAutomation = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });

    // Update fields
    const fields = ['name', 'description', 'status', 'nodes', 'edges', 'clientId'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        automation[field] = req.body[field];
      }
    });

    await automation.save();
    res.json(automation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteAutomation = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });

    await automation.deleteOne();
    res.json({ message: 'Automation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

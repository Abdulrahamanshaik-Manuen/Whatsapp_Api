import Automation from '../models/Automation.js';

/**
 * @desc Get all automations for the user
 * @route GET /api/automations
 */
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

/**
 * @desc Create a new automation
 * @route POST /api/automations
 */
export const createAutomation = async (req, res) => {
  try {
    const { name, description, nodes, edges } = req.body;
    
    const automation = await Automation.create({
      name,
      description,
      nodes: nodes || [],
      edges: edges || [],
      createdBy: req.user.user_id,
      clientId: req.user.role === 'client' ? req.user.user_id : null
    });
    
    res.status(201).json(automation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @desc Get automation by ID
 * @route GET /api/automations/:id
 */
export const getAutomationById = async (req, res) => {
  try {
    const automation = await Automation.findById(req.params.id);
    if (!automation) return res.status(404).json({ error: 'Automation not found' });
    
    res.json(automation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Update an automation
 * @route PUT /api/automations/:id
 */
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

/**
 * @desc Delete an automation
 * @route DELETE /api/automations/:id
 */
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

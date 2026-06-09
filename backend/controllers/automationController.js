import Automation from '../models/Automation.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { notifyAdmins } from './notificationController.js';

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
    const { name, description, status, nodes, edges, clientId, businessGoal, priority } = req.body;
    const userRole = (req.user.role || '').toLowerCase();
    
    // If client is creating, enforce status = requested
    // If admin is creating, respect body or default to active
    let finalStatus = (status || 'active');
    if (userRole === 'client') {
        finalStatus = 'requested';
    }
    const finalClientId = req.user.role === 'client' ? req.user.user_id : (clientId || null);

    const automation = await Automation.create({
      name,
      description,
      businessGoal,
      priority,
      nodes: nodes || [],
      edges: edges || [],
      status: finalStatus,
      createdBy: req.user.user_id,
      clientId: finalClientId
    });

    // Notify Admin if client requested
    if (userRole === 'client') {
        await notifyAdmins(
            'New Automation Request',
            `Client requested a new automation: "${name}". Priority: ${priority || 'Medium'}. Goal: ${businessGoal || 'None'}.`,
            'info'
        );
    }

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

    const oldClientId = automation.clientId;
    const oldStatus = automation.status;

    // Update fields
    const fields = ['name', 'description', 'status', 'nodes', 'edges', 'clientId'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        automation[field] = req.body[field];
      }
    });

    await automation.save();

    // Notify Client if assigned or status changed by Admin
    if (req.user.role === 'admin' && automation.clientId) {
        const isNewAssignment = !oldClientId || oldClientId.toString() !== automation.clientId.toString();
        const isStatusChange = oldStatus !== automation.status;

        if (isNewAssignment || isStatusChange) {
            await Notification.create({
                userId: automation.clientId,
                title: 'Automation Updated',
                message: isNewAssignment 
                    ? `A new automation "${automation.name}" has been assigned to you.` 
                    : `Your automation "${automation.name}" status is now: ${automation.status}.`,
                type: 'info'
            });
        }
    }

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

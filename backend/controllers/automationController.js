import AutomationFlow from '../models/AutomationFlow.js';

export const createFlow = async (req, res) => {
  try {
    const flow = new AutomationFlow(req.body);
    await flow.save();
    res.status(201).json(flow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllFlows = async (req, res) => {
  try {
    const flows = await AutomationFlow.find();
    res.status(200).json(flows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFlowById = async (req, res) => {
  try {
    const flow = await AutomationFlow.findById(req.params.id);
    if (!flow) return res.status(404).json({ message: 'Flow not found' });
    res.status(200).json(flow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateFlow = async (req, res) => {
  try {
    const flow = await AutomationFlow.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!flow) return res.status(404).json({ message: 'Flow not found' });
    res.status(200).json(flow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteFlow = async (req, res) => {
  try {
    const flow = await AutomationFlow.findByIdAndDelete(req.params.id);
    if (!flow) return res.status(404).json({ message: 'Flow not found' });
    res.status(200).json({ message: 'Flow deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

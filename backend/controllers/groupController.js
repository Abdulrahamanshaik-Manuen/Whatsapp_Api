import Group from '../models/Group.js';
import mongoose from 'mongoose';

/**
 * Create a new contact group
 */
export const createGroup = async (req, res) => {
    try {
        const { name, description, contacts } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const group = new Group({
            userId,
            name,
            description,
            contacts: contacts || []
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all groups for the logged-in user
 */
export const getGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        const groups = await Group.find({ userId }).sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single group by ID
 */
export const getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Group ID' });
        }

        const group = await Group.findOne({ _id: id, userId });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update group details
 */
export const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, contacts } = req.body;
        const userId = req.user.id;

        const group = await Group.findOne({ _id: id, userId });
        if (!group) {
            return res.status(404).json({ error: 'Group not found or unauthorized' });
        }

        if (name) group.name = name;
        if (description !== undefined) group.description = description;
        if (contacts) group.contacts = contacts;

        await group.save();
        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a group
 */
export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await Group.findOneAndDelete({ _id: id, userId });
        if (!result) {
            return res.status(404).json({ error: 'Group not found or unauthorized' });
        }

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Add contacts to an existing group
 */
export const addContactsToGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { contacts } = req.body;
        const userId = req.user.id;

        if (!Array.isArray(contacts)) {
            return res.status(400).json({ error: 'Contacts must be an array of phone numbers' });
        }

        const group = await Group.findOne({ _id: id, userId });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Add new contacts and the pre-save hook will deduplicate
        group.contacts.push(...contacts);
        await group.save();

        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Remove a single contact from a group
 */
export const removeContactFromGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { contact } = req.body;
        const userId = req.user.id;

        const group = await Group.findOne({ _id: id, userId });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        group.contacts = group.contacts.filter(c => c !== contact);
        await group.save();

        res.json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

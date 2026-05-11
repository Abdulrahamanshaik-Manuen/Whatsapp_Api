import Group from '../models/Group.js';
import Contact from '../models/Contact.js';
import mongoose from 'mongoose';

/**
 * Create a new contact group
 */
export const createGroup = async (req, res) => {
    try {
        const { name, description, contacts } = req.body;
        const user_id = req.user.user_id;

        if (!name) {
            return res.status(400).json({ error: 'Group name is required' });
        }

        const group = new Group({
            user_id,
            name,
            description,
            contacts: contacts || [],
            tags: req.body.tags || []
        });

        await group.save();
        res.status(201).json(group);
    } catch (error) {
        console.error("Create Group Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all groups for the logged-in user
 */
export const getGroups = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        console.log("Fetching groups for user:", user_id);
        const groups = await Group.find({ user_id }).sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        console.error("Get Groups Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single group by ID
 */
export const getGroupById = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid Group ID' });
        }

        const group = await Group.findOne({ _id: id, user_id });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        res.json(group);
    } catch (error) {
        console.error("Get Group By ID Error:", error);
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
        const user_id = req.user.user_id;

        const group = await Group.findOne({ _id: id, user_id });
        if (!group) {
            return res.status(404).json({ error: 'Group not found or unauthorized' });
        }

        if (name) group.name = name;
        if (description !== undefined) group.description = description;
        if (contacts) group.contacts = contacts;
        if (req.body.tags) group.tags = req.body.tags;

        await group.save();
        res.json(group);
    } catch (error) {
        console.error("Update Group Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a group
 */
export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        const result = await Group.findOneAndDelete({ _id: id, user_id });
        if (!result) {
            return res.status(404).json({ error: 'Group not found or unauthorized' });
        }

        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error("Delete Group Error:", error);
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
        const user_id = req.user.user_id;

        if (!Array.isArray(contacts)) {
            return res.status(400).json({ error: 'Contacts must be an array of phone numbers' });
        }

        const group = await Group.findOne({ _id: id, user_id });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Add new contacts and the pre-save hook will deduplicate
        group.contacts.push(...contacts);
        await group.save();

        res.json(group);
    } catch (error) {
        console.error("Add Contacts to Group Error:", error);
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
        const user_id = req.user.user_id;

        const group = await Group.findOne({ _id: id, user_id });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        group.contacts = group.contacts.filter(c => c !== contact);
        await group.save();

        res.json(group);
    } catch (error) {
        console.error("Remove Contact from Group Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get full contact details for all members of a group
 */
export const getGroupContacts = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        const group = await Group.findOne({ _id: id, user_id });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // Fetch contacts from the Contact model matching the phone numbers in the group
        const contacts = await Contact.find({ 
            phoneNumber: { $in: group.contacts }
        });

        res.json(contacts);
    } catch (error) {
        console.error("Get Group Contacts Error:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Grant marketing consent to all members of a group
 */
export const grantGroupConsent = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;

        const group = await Group.findOne({ _id: id, user_id });
        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        if (!group.contacts || group.contacts.length === 0) {
            return res.status(400).json({ error: 'Group has no contacts' });
        }

        // Use bulkWrite for efficiency
        const bulkOps = group.contacts.map(phone => ({
            updateOne: {
                filter: { phoneNumber: phone },
                update: { 
                    $set: { 
                        consent: true, 
                        consent_status: 'verified', 
                        consent_timestamp: new Date(),
                        userId: user_id 
                    } 
                },
                upsert: true
            }
        }));

        const result = await Contact.bulkWrite(bulkOps);

        res.json({ 
            message: `Consent granted to ${group.contacts.length} members`,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount
        });
    } catch (error) {
        console.error("Grant Group Consent Error:", error);
        res.status(500).json({ error: error.message });
    }
};

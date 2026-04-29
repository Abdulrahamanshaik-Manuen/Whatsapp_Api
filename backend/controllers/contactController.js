import Contact from '../models/Contact.js';
import Message from '../models/Message.js';

export const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ lastMessageAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const saveContact = async (req, res) => {
    try {
        const { phoneNumber, name, email, location, details } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const updateData = { name };
        if (email !== undefined) updateData.email = email;
        if (location !== undefined) updateData.location = location;
        if (details !== undefined) updateData.details = details;

        let contact = await Contact.findOneAndUpdate(
            { phoneNumber: cleanPhone },
            { $set: updateData },
            { new: true }
        );

        if (contact) {
            return res.status(200).json(contact);
        }

        contact = new Contact({ phoneNumber: cleanPhone, name, email, location, details, status: 'offline' });
        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getContactDetails = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) return res.status(404).json({ error: "Contact not found" });
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!contact) return res.status(404).json({ error: "Contact not found" });
        res.status(200).json(contact);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findByIdAndDelete(req.params.id);
        if (!contact) return res.status(404).json({ error: "Contact not found" });
        await Message.deleteMany({ contactId: req.params.id });
        res.status(200).json({ message: "Contact deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const searchContacts = async (req, res) => {
    try {
        const { query } = req.params;
        const contacts = await Contact.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { phoneNumber: { $regex: query, $options: 'i' } }
            ]
        });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendContact = async (req, res) => { res.status(501).json({ message: "Not implemented yet" }); };

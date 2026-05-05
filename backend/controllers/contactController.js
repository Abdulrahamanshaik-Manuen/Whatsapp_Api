import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import { parseCSV, validateContactData } from '../utility/csvParser.js';
import fs from 'fs';

export const getContacts = async (req, res) => {
    try {
        const { consent_status, consent_source, consent } = req.query;
        const filter = {};
        
        if (consent_status) filter.consent_status = consent_status;
        if (consent_source) filter.consent_source = consent_source;
        if (consent !== undefined) filter.consent = consent === 'true';

        const contacts = await Contact.find(filter).sort({ lastMessageAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const saveContact = async (req, res) => {
    try {
        const { phoneNumber, name, email, location, details, consent, consent_source } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }
        const cleanPhone = phoneNumber.replace(/\D/g, '');

        // Consent validation for manual addition
        const updateData = {
            name,
            consent: consent === true || consent === 'true',
            consent_status: (consent === true || consent === 'true') ? 'verified' : 'unverified',
            consent_source: consent_source || 'web', // Default to web if not provided
            consent_timestamp: (consent === true || consent === 'true') ? new Date() : null
        };

        if (email !== undefined) updateData.email = email;
        if (location !== undefined) updateData.location = location;
        if (details !== undefined) updateData.details = details;

        let contact = await Contact.findOneAndUpdate(
            { phoneNumber: cleanPhone },
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (contact) {
            return res.status(200).json(contact);
        }

        contact = new Contact({
            phoneNumber: cleanPhone,
            name,
            email,
            location,
            details,
            status: 'offline',
            ...updateData
        });
        await contact.save();
        res.status(201).json(contact);
    } catch (error) {
        console.error("Error in saveContact:", error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Capture consent from QR code scans
 */
export const captureQRConsent = async (req, res) => {
    try {
        const { phoneNumber, name, location, email } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }
        
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        
        const updateData = {
            name: name || 'QR Lead',
            consent: true,
            consent_status: 'verified',
            consent_source: 'qr',
            consent_timestamp: new Date()
        };

        if (location) updateData.location = location;
        if (email) updateData.email = email;

        const contact = await Contact.findOneAndUpdate(
            { phoneNumber: cleanPhone },
            { $set: updateData },
            { upsert: true, new: true }
        );

        res.status(200).json({
            message: "Consent captured successfully via QR",
            contact
        });
    } catch (error) {
        console.error("Error in captureQRConsent:", error);
        res.status(500).json({ error: error.message });
    }
};

export const uploadContacts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "CSV file is required" });
        }

        const rawData = await parseCSV(req.file.path);
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const item of rawData) {
            const { valid, data, error } = validateContactData(item);
            if (!valid) {
                results.failed++;
                results.errors.push({ item, error });
                continue;
            }

            try {
                // Ensure the data from CSV is marked as 'csv' source if not already
                const finalData = {
                    ...data,
                    consent_source: data.consent_source || 'csv'
                };

                await Contact.findOneAndUpdate(
                    { phoneNumber: data.phoneNumber },
                    { $set: finalData },
                    { upsert: true, new: true }
                );
                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push({ item, error: err.message });
            }
        }

        // Clean up uploaded file
        fs.unlink(req.file.path, (err) => { if (err) console.error("Error deleting CSV file:", err); });

        res.status(200).json(results);
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

export const getGroups = async (req, res) => {
    try {
        const groups = await Contact.distinct('details.group');
        const tags = await Contact.distinct('tags');
        const allGroups = [...new Set([...groups, ...tags])].filter(Boolean);
        res.status(200).json(allGroups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendContact = async (req, res) => { res.status(501).json({ message: "Not implemented yet" }); };



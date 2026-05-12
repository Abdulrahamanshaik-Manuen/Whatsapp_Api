import Contact from '../models/Contact.js';
import Message from '../models/Message.js';
import { parseFile, validateContactData } from '../utility/csvParser.js';
import fs from 'fs';
import { uploadToCloudinary } from '../config/cloudinary.js';
import axios from 'axios';

export const getContacts = async (req, res) => {
    try {
        const { consent_status, consent_source, consent } = req.query;
        const filter = {};

        if (consent_status) filter.consent_status = consent_status;
        if (consent_source) filter.consent_source = consent_source;
        if (consent !== undefined) filter.consent = consent === 'true';

        const contacts = await Contact.find(filter).sort({ createdAt: -1 }); // changed from lastMessageAt which isn't in schema
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
        const { phoneNumber, name, location, email, userId, details } = req.body;
        if (!phoneNumber) {
            return res.status(400).json({ error: "Phone number is required" });
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '');

        const updateData = {
            name: name || 'QR Lead',
            consent: true,
            consent_status: 'verified',
            consent_source: 'qr',
            consent_timestamp: new Date(),
            userId: userId || 'system',
            details: {
                ...details,
                joined: new Date().toISOString()
            }
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
            return res.status(400).json({ error: "File is required" });
        }

        console.log("Uploading file to Cloudinary:", req.file.originalname);

        // 1. Save to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file.path);
        const cloudinaryUrl = cloudinaryResult.secure_url;
        console.log("File saved to Cloudinary:", cloudinaryUrl);

        // 2. Fetch from Cloudinary (as per user requirement "fetched from cloudinary")
        console.log("Fetching file back from Cloudinary...");
        const response = await axios.get(cloudinaryUrl, {
            responseType: 'arraybuffer',
            timeout: 10000 // 10s timeout
        });
        const fileBuffer = Buffer.from(response.data);
        console.log("File fetched successfully, buffer size:", fileBuffer.length);

        // 3. Parse the fetched data
        // We pass the buffer and the original name to ensure correct extension detection
        console.log("Starting data parse...");
        const rawData = await parseFile(fileBuffer, req.file.originalname);
        console.log(`Successfully parsed ${rawData.length} rows`);

        const results = {
            success: 0,
            failed: 0,
            errors: [],
            cloudinary_url: cloudinaryUrl
        };

        for (const [index, item] of rawData.entries()) {
            try {
                console.log(`Processing row ${index + 1}:`, item);
                const { valid, data, error } = validateContactData(item);
                if (!valid) {
                    results.failed++;
                    results.errors.push({ item, error });
                    continue;
                }

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
                console.error("Error processing row:", err.message);
                results.failed++;
                results.errors.push({ item, error: err.message });
            }
        }

        // Clean up local temp file
        fs.unlink(req.file.path, (err) => { if (err) console.error("Error deleting temp file:", err); });

        console.log("All rows processed. Success:", results.success, "Failed:", results.failed);
        res.status(200).json(results);
    } catch (error) {
        console.error("Upload controller error:", error);
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
        // Filter out null/empty values and anything that looks like a tag (starts with #)
        const allGroups = groups.filter(g => g && !g.startsWith('#'));
        res.status(200).json(allGroups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const sendContact = async (req, res) => { res.status(501).json({ message: "Not implemented yet" }); };

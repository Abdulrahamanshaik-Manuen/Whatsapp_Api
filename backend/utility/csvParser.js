import csv from 'csv-parser';
import fs from 'fs';
import xlsx from 'xlsx';
import path from 'path';
import { Readable } from 'stream';

export const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

export const parseExcel = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
};

export const parseFile = async (input, originalName) => {
    const nameToCheck = originalName || (typeof input === 'string' ? input : '');
    const ext = path.extname(nameToCheck).toLowerCase();
    
    if (ext === '.csv') {
        return new Promise((resolve, reject) => {
            const results = [];
            const stream = Buffer.isBuffer(input) ? Readable.from(input) : fs.createReadStream(input);
            stream.pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', () => resolve(results))
                .on('error', (err) => reject(err));
        });
    } else if (ext === '.xlsx' || ext === '.xls') {
        const workbook = Buffer.isBuffer(input) ? xlsx.read(input, { type: 'buffer' }) : xlsx.readFile(input);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(worksheet);
    } else {
        throw new Error(`Unsupported file format: ${ext || 'unknown'}`);
    }
};

export const validateContactData = (contact) => {
    // Map various possible header names to internal keys
    const phoneNumber = contact.phoneNumber || contact['Phone Number'] || contact.phone || contact.Phone || contact.Mobile;
    const firstName = contact.firstName || contact['First Name'] || contact.fname;
    const lastName = contact.lastName || contact['Last Name'] || contact.lname;
    const name = contact.name || contact.Name || (firstName ? `${firstName} ${lastName || ''}`.trim() : 'Unknown Contact');
    
    const consent = contact.consent || contact['User Provided Consent'] || contact.Consent;
    const consent_source = contact.consent_source || contact['Consent Source'] || contact.source;
    const email = contact.email || contact.Email || contact.Mail;
    const location = contact.location || contact.Location || contact.City;

    if (!phoneNumber) return { valid: false, error: 'Phone number is required' };

    // Ensure phoneNumber is a string (Excel might parse it as a number)
    const phoneStr = String(phoneNumber);

    // Basic phone number cleaning
    const cleanPhone = phoneStr.replace(/\D/g, '');
    if (cleanPhone.length < 10) return { valid: false, error: 'Invalid phone number' };

    return {
        valid: true,
        data: {
            name,
            email,
            location,
            phoneNumber: cleanPhone,
            consent: consent === 'true' || consent === true || String(consent).toLowerCase() === 'yes',
            consent_status: (consent === 'true' || consent === true || String(consent).toLowerCase() === 'yes') ? 'verified' : 'unverified',
            consent_source: String(consent_source || 'csv').toLowerCase(),
            consent_timestamp: (consent === 'true' || consent === true || String(consent).toLowerCase() === 'yes') ? new Date() : null
        }
    };
};

import csv from 'csv-parser';
import fs from 'fs';

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

export const validateContactData = (contact) => {
    const { phoneNumber, name, consent, consent_source } = contact;
    
    if (!phoneNumber) return { valid: false, error: 'Phone number is required' };
    
    // Basic phone number cleaning
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length < 10) return { valid: false, error: 'Invalid phone number' };

    return { 
        valid: true, 
        data: {
            ...contact,
            phoneNumber: cleanPhone,
            consent: consent === 'true' || consent === true,
            consent_status: (consent === 'true' || consent === true) ? 'verified' : 'unverified',
            consent_source: consent_source || 'csv',
            consent_timestamp: (consent === 'true' || consent === true) ? new Date() : null
        } 
    };
};

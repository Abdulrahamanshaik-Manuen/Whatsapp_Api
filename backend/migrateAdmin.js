import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Admin from './models/Admin.js';

dotenv.config();

const migrateAdmin = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected successfully.");

        // 1. Find the admin in the User collection
        // Since we are going to remove 'role' from the schema, we must search dynamically
        const existingAdmin = await mongoose.connection.db.collection('users').findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log(`Found existing admin user: ${existingAdmin.name} (${existingAdmin.phone})`);

            // Check if this admin already exists in the Admin collection
            const adminInNewModel = await Admin.findOne({ phone: existingAdmin.phone });
            
            if (!adminInNewModel) {
                // Copy to Admin collection
                // We use mongoose.connection.db directly or Mongoose model, but let's bypass pre-save hook since password is ALREADY hashed!
                // Using mongoose.connection.db.collection('admins').insertOne keeps the exact password hash without re-hashing!
                const adminData = {
                    name: existingAdmin.name,
                    email: 'connect@manuen.com',
                    phone: existingAdmin.phone,
                    password: existingAdmin.password, // Keep the exact hashed password!
                    role: 'admin',
                    permissions: ['all'],
                    is_active: true,
                    created_at: existingAdmin.created_at || new Date()
                };

                await mongoose.connection.db.collection('admins').insertOne(adminData);
                console.log("Successfully migrated admin credentials to 'admins' collection with email 'connect@manuen.com'.");
            } else {
                console.log("Admin with this phone number already exists in the 'admins' collection.");
            }

            // 2. Delete from 'users' collection so they aren't duplicate
            await mongoose.connection.db.collection('users').deleteOne({ _id: existingAdmin._id });
            console.log("Successfully removed old admin record from 'users' collection.");

        } else {
            console.log("No user with role 'admin' found in 'users' collection.");
            
            // Check if any admin exists in the Admins collection. If not, seed a default one.
            const adminCount = await Admin.countDocuments({});
            if (adminCount === 0) {
                console.log("No admins found in 'admins' collection. Seeding a default administrator...");
                const defaultAdmin = new Admin({
                    name: 'Admin',
                    email: 'connect@manuen.com',
                    phone: '9999999999',
                    password: 'Admin@123', // Will be hashed by mongoose pre-save hook
                    role: 'admin',
                    permissions: ['all']
                });
                await defaultAdmin.save();
                console.log("Seeded default administrator: Phone: 9999999999, Password: Admin@123");
            } else {
                console.log(`There are already ${adminCount} administrator(s) in the 'admins' collection.`);
            }
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrateAdmin();

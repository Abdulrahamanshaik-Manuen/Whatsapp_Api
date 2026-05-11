import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const user = await mongoose.connection.db.collection('users').findOne({});
    if (user) {
        console.log('User Keys:', Object.keys(user));
        console.log('User waba_id:', user.waba_id);
    } else {
        console.log('No users found at all.');
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

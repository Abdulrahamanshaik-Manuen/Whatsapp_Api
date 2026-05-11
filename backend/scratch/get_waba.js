import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const User = mongoose.model('User', new mongoose.Schema({ waba_id: String }));

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const user = await User.findOne({ waba_id: { $exists: true } });
    if (user) {
        console.log('Found User WABA ID:', user.waba_id);
    } else {
        console.log('No user with WABA ID found.');
    }
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});

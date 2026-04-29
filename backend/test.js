import mongoose from 'mongoose';

mongoose.connect('mongodb+srv://rahaman-developer:rahaman2026@whatsappintegration.gsw6wek.mongodb.net/whatsapp_db?retryWrites=true&w=majority').then(async () => {
    console.log("Connected to DB:", mongoose.connection.db.databaseName);
    mongoose.connection.close();
    process.exit(0);
});

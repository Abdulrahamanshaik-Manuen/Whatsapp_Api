import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars explicitly from backend/.env at the very beginning
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

import express from 'express';
// Restart Trigger v1.2
import cors from 'cors';
import connectDB from '../config/db.js';

import http from 'http';
import { Server } from 'socket.io';
import routes from '../routes/Routes.js';
import '../workers/campaignQueue.js';

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(cors());
app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Pass io to request object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

import { oauthCallback } from '../controllers/whatsappController.js';

// Routes
app.get('/api/whatsapp/callback', oauthCallback);

// Basic route
app.get('/', (req, res) => {
  res.send('WhatsApp API Backend is running...');
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
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
import { apiLimiter } from '../middlewares/rateLimiter.js';
import SystemLog from '../models/SystemLog.js';

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
export const io = new Server(server, {
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

// Pass io to request object BEFORE routes so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Apply rate limiter to all API routes
app.use('/api', apiLimiter);
app.use('/api', routes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

import { oauthCallback } from '../controllers/whatsappController.js';

// Routes
app.get('/api/whatsapp/callback', oauthCallback);

// Basic route
app.get('/', (req, res) => {
  res.send('WhatsApp API Backend is running...');
});

// Global Error Handler for System Logs
app.use(async (err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  try {
    const log = await SystemLog.create({
      level: 'error',
      message: err.message || 'Unknown Server Error',
      stack: err.stack,
      source: 'internal'
    });
    
    // Emit to admin if possible
    if (req.io) {
      req.io.to('admin_room').emit('new_system_log', log);
    }
  } catch (logErr) {
    console.error('Failed to save system log:', logErr);
  }

  res.status(500).json({ error: 'Internal Server Error' });
});

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join', (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`User ${userId} joined their room`);
    }
  });

  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log('Admin joined admin room');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
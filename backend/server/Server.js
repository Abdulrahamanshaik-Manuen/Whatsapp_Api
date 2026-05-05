import os from 'os';
// ... existing imports ...
import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from '../config/db.js';

import http from 'http';
import { Server } from 'socket.io';
import routes from '../routes/Routes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars explicitly from backend/.env
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

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

// Pass io to request object so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api', routes);

// Basic route
app.get('/', (req, res) => {
  res.send('WhatsApp API Backend is running...');
});

app.get('/api/system/ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let ip = '127.0.0.1';
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        ip = alias.address;
      }
    }
  }
  res.json({ ip });
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



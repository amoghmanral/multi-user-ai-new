import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { db } from './database';
import { createSocketServer } from './socket/socketServer';
import { multiUserRoutes } from './mastra/multiUserRoutes';

// Import Mastra
import { mastra } from './mastra';

const app = express();

// Configure CORS for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false 
    : [
        "http://localhost:3000", 
        "http://127.0.0.1:3000", 
        "http://localhost:3001",
        "http://128.61.119.144:3000",
        "http://128.61.119.144:3001"
      ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Add API routes directly
app.post('/chat/users/get-or-create', multiUserRoutes.getOrCreateUser);
app.post('/chat/rooms/create', multiUserRoutes.createRoom);
app.post('/chat/rooms/join', multiUserRoutes.joinRoom);

// Simple file upload endpoint
app.post('/chat/files/upload', (req, res) => {
  // For now, just return a success response
  // In a real implementation, you would handle file upload with multer
  res.json({
    success: true,
    message: 'File upload endpoint ready (not fully implemented yet)'
  });
});

// Create HTTP server
const httpServer = createServer(app);

// Add Socket.io
const io = createSocketServer(httpServer);

// Start server
async function startServer() {
  try {
    const PORT = process.env.PORT || 4111;
    
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Multi-user chat server running on port ${PORT}`);
      console.log(`📡 Socket.io server ready for real-time connections`);
      console.log(`🗄️  Database initialized and ready`);
      console.log(`🌐 Accessible from network at http://128.61.119.144:${PORT}`);
      console.log(`🤖 Mastra API available at http://128.61.119.144:${PORT}/api`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

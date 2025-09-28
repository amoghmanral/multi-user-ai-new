import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { db } from './database';
import { createSocketServer } from './socket/socketServer';

// Import Mastra
import { mastra } from './mastra';

const app = express();
const httpServer = createServer(app);

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

// Mount Mastra API
app.use('/api', mastra.apiRouter);

// Start server
async function startServer() {
  try {
    // Initialize database
    await db.initialize();
    console.log('✅ Database initialized');

    // Create Socket.io server
    const io = createSocketServer(httpServer);
    console.log('✅ Socket.io server created');

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
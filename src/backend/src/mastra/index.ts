import { Mastra } from '@mastra/core/mastra';
import { chatWorkflow } from './workflows/chatWorkflow';
import { apiRoutes } from './apiRegistry';
import { starterAgent } from './agents/starterAgent';
import { storage } from './memory';
import { db } from '../database';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createSocketServer } from '../socket/socketServer';

/**
 * Main Mastra configuration
 *
 * This is where you configure your agents, workflows, storage, and other settings.
 * The starter template includes:
 * - A basic agent that can be customized
 * - A chat workflow for handling conversations
 * - In-memory storage (replace with your preferred database)
 * - API routes for the frontend to communicate with
 * - Multi-user chat features with Socket.io
 * - Database integration with SQLite
 */

// Initialize database
await db.initialize();

export const mastra = new Mastra({
  agents: { starterAgent },
  workflows: { chatWorkflow },
  storage,
  telemetry: {
    enabled: true,
  },
  server: {
    apiRoutes,
  },
});

// Create HTTP server and Socket.io
const httpServer = createServer();
const io = createSocketServer(httpServer);

// Store socket.io instance for potential use
(mastra as any).socketIO = io;
(mastra as any).httpServer = httpServer;

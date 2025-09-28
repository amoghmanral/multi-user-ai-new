import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { db } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { mastra } from '../mastra';
import { decisionAgent } from '../mastra/agents/starterAgent';

// Function to call Mastra AI with proper memory and context
async function callMastraAI(context: any): Promise<string> {
  try {
    // Use the proper Mastra API to get the agent (use the key from the agents object)
    const starterAgent = mastra.getAgent('starterAgent');

    if (!starterAgent) {
      throw new Error('Starter agent not found');
    }

    // Create a unique thread ID for this room
    const threadId = `room-${context.roomId}`;

    // Use the user ID as the resource ID for memory persistence
    const resourceId = `user-${context.userId}`;

    // Build enhanced context with room information
    const roomMembers = context.roomMembers || [];
    const memberNames = roomMembers.map((m: any) => m.name).join(', ');

    const enhancedPrompt = `Room Context:
- Room ID: ${context.roomId}
- Current Users: ${memberNames}
- Total Members: ${roomMembers.length}

Recent Messages: ${JSON.stringify(context.recentMessages.slice(-5), null, 2)}

Current Message: "${context.currentMessage}"`;

    // Use the agent's generateVNext method with memory (required for all OpenAI models)
    const response = await starterAgent.generateVNext([{ role: 'user', content: enhancedPrompt }], {
      memory: {
        thread: threadId,
        resource: resourceId,
      },
    });

    // generateVNext returns a different structure - we need to get the result
    const result = await response.result;
    console.log('🤖 AI Response:', result.text);

    if (!result.text) {
      console.error('❌ AI returned empty response');
      return '{"message": "I understand your message and I\'m here to help! What would you like to know more about?", "participant_analysis": {"understanding_levels": {}, "conversation_type": "casual", "group_dynamics": "collaborative"}}';
    }

    return result.text;
  } catch (error) {
    console.error('Error calling Mastra AI:', error);

    // Fallback to simple rule-based responses for demo
    const message = context.currentMessage.toLowerCase();
    // if (message.includes('lru') && message.includes('cache')) {
    //   return 'An LRU (Least Recently Used) cache is a data structure that removes the least recently accessed items when it reaches capacity. It\'s commonly used in computer systems to optimize memory usage and improve performance by keeping frequently accessed data readily available.';
    // } else if (message.includes('react')) {
    //   return 'React is a JavaScript library for building user interfaces, particularly web applications. It uses a component-based architecture and a virtual DOM to efficiently update the UI when data changes.';
    // } else if (message.includes('javascript')) {
    //   return 'JavaScript is a programming language that\'s primarily used for web development. It runs in browsers and can also be used on servers with Node.js. It\'s known for its flexibility and dynamic typing.';
    // } else if (message.includes('machine learning')) {
    //   return 'Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data without being explicitly programmed for every scenario.';
    // } else if (message.includes('?') || message.includes('what') || message.includes('how')) {
    //   return 'That\'s an interesting question! I\'m here to help with your multi-user chat. Feel free to ask me anything about technology, programming, or general topics.';
    // } else {
    //   return 'I understand your message and I\'m here to help with your conversation! What would you like to know more about?';
    // }
  }
}

// Function to make initial decision: Should AI respond?
async function shouldAIReply(context: any): Promise<{ should_reply: boolean }> {
  try {
    const roomMembers = context.roomMembers || [];
    const memberNames = roomMembers.map((m: any) => m.name).join(', ');

    const decisionPrompt = `You are analyzing a message in a multi-user group chat to decide if the AI should respond based on the decision logic given below. Your decision needs to be immediate. Speed is most important here.

Room Context:
- Room ID: ${context.roomId}
- Current Users: ${memberNames}
- Total Members: ${roomMembers.length}

Recent Messages: ${JSON.stringify(context.recentMessages.slice(-3), null, 2)}

Current Message: "${context.currentMessage}"`;

    const response = await decisionAgent.generateVNext(
      [{ role: 'user', content: decisionPrompt }],
      {
        memory: {
          thread: `room-${context.roomId}`,
          resource: `user-${context.userId}`,
        },
      },
    );

    const result = await response.result;
    console.log('🤖 Decision Response:', result.text);

    if (!result.text) {
      console.error('❌ Decision agent returned empty response');
      return { should_reply: false };
    }

    const decision = JSON.parse(result.text);
    return decision;
  } catch (error) {
    console.error('Error in AI decision:', error);
    // Default to not responding if decision fails
    return { should_reply: false };
  }
}

export function createSocketServer(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === 'production'
          ? false
          : [
              'http://localhost:3000',
              'http://127.0.0.1:3000',
              'http://localhost:3001',
              'http://128.61.119.144:3000',
              'http://128.61.119.144:3001',
            ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join room
    socket.on('join-room', async (data) => {
      try {
        const { roomId, userId } = data;
        console.log(`User ${userId} joining room ${roomId}`);

        socket.join(roomId);

        // Store socket info
        socket.data = { userId, roomId };

        // Get user info from database
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId,
          user: user ? { id: user.id, name: user.name, avatarColor: user.avatar_color } : null,
        });

        // Send current room members to the joining user
        const members = await db.all(
          `
          SELECT u.id, u.name, u.avatar_color 
          FROM users u 
          JOIN room_members rm ON u.id = rm.user_id 
          WHERE rm.room_id = ?
        `,
          [roomId],
        );

        socket.emit(
          'room-members',
          members.map((m) => ({
            id: m.id,
            name: m.name,
            avatarColor: m.avatar_color,
          })),
        );

        console.log(`User ${userId} successfully joined room ${roomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Send message
    socket.on('send-message', async (data) => {
      try {
        const { roomId, userId, content, messageType = 'text' } = data;
        console.log(`Message from ${userId} in room ${roomId}: ${content}`);

        // Save message to database
        const messageId = uuidv4();
        await db.run(
          'INSERT INTO messages (id, room_id, user_id, content, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [messageId, roomId, userId, content, messageType, new Date().toISOString()],
        );

        // Get user info
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        // Broadcast message to room
        const message = {
          id: messageId,
          roomId,
          userId,
          content,
          type: messageType,
          createdAt: new Date().toISOString(),
          user: user ? { id: user.id, name: user.name, avatarColor: user.avatar_color } : null,
        };

        io.to(roomId).emit('new-message', message);
        console.log(`Message broadcasted to room ${roomId}`);

        // Check if AI should respond automatically (only for regular text messages)
        if (messageType === 'text') {
          console.log(`🤖 Phase 1: Evaluating if AI should respond to: ${content}`);

          // Phase 1: Instant decision call (no timeout)
          (async () => {
            try {
              // Get room context for AI
              const recentMessages = await db.all(
                `
                SELECT m.*, u.name as user_name, u.avatar_color 
                FROM messages m 
                LEFT JOIN users u ON m.user_id = u.id 
                WHERE m.room_id = ? 
                ORDER BY m.created_at DESC 
                LIMIT 10
              `,
                [roomId],
              );

              // Get room members
              const roomMembers = await db.all(
                `
                SELECT u.id, u.name, u.avatar_color 
                FROM users u 
                JOIN room_members rm ON u.id = rm.user_id 
                WHERE rm.room_id = ?
              `,
                [roomId],
              );

              // Create context for AI
              const context = {
                recentMessages: recentMessages.reverse(),
                roomMembers,
                currentMessage: content,
                roomId,
                userId,
              };

              // Phase 1: Make decision
              const decision = await shouldAIReply(context);
              console.log(
                `🤖 Decision: ${decision.should_reply ? 'WILL respond' : 'WILL NOT respond'}`,
              );

              if (decision.should_reply) {
                // Phase 2: Show loading indicator and generate response
                socket.to(roomId).emit('ai-typing', { isTyping: true });

                // Generate the actual response
                const aiResponse = await callMastraAI(context);

                // Parse the response
                try {
                  const parsedResponse = JSON.parse(aiResponse);

                  const aiMessage = {
                    id: uuidv4(),
                    roomId,
                    userId: null,
                    content: parsedResponse.message,
                    type: 'ai',
                    createdAt: new Date().toISOString(),
                    user: { id: 'ai', name: 'AI Assistant', avatarColor: '#4ECDC4' },
                  };

                  // Save AI message to database
                  await db.run(
                    `
                    INSERT INTO messages (id, room_id, user_id, content, type, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                  `,
                    [
                      aiMessage.id,
                      aiMessage.roomId,
                      aiMessage.userId,
                      aiMessage.content,
                      aiMessage.type,
                      aiMessage.createdAt,
                    ],
                  );

                  // Stop typing indicator and broadcast response
                  socket.to(roomId).emit('ai-typing', { isTyping: false });
                  socket.to(roomId).emit('new-message', aiMessage);
                  console.log(`🤖 AI responded: ${parsedResponse.message.substring(0, 50)}...`);
                } catch (error) {
                  // Fallback: if JSON parsing fails, send the raw response
                  console.log('Failed to parse AI response as JSON, sending raw response');
                  const aiMessage = {
                    id: uuidv4(),
                    roomId,
                    userId: null,
                    content: aiResponse,
                    type: 'ai',
                    createdAt: new Date().toISOString(),
                    user: { id: 'ai', name: 'AI Assistant', avatarColor: '#4ECDC4' },
                  };

                  await db.run(
                    `
                    INSERT INTO messages (id, room_id, user_id, content, type, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                  `,
                    [
                      aiMessage.id,
                      aiMessage.roomId,
                      aiMessage.userId,
                      aiMessage.content,
                      aiMessage.type,
                      aiMessage.createdAt,
                    ],
                  );

                  socket.to(roomId).emit('ai-typing', { isTyping: false });
                  socket.to(roomId).emit('new-message', aiMessage);
                }
              } else {
                console.log(`🤖 AI chose not to respond.`);
              }
            } catch (error) {
              console.error('Error in AI decision process:', error);
              socket.to(roomId).emit('ai-typing', { isTyping: false });
            }
          })(); // Execute immediately
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle AI mention
    socket.on('ai-mention', async (data) => {
      try {
        const { roomId, userId, content } = data;
        console.log(`AI mention from ${userId} in room ${roomId}: ${content}`);

        // Emit typing indicator
        socket.to(roomId).emit('ai-typing', { isTyping: true });

        // Get room context for AI
        const recentMessages = await db.all(
          `
          SELECT m.*, u.name as user_name, u.avatar_color 
          FROM messages m 
          LEFT JOIN users u ON m.user_id = u.id 
          WHERE m.room_id = ? 
          ORDER BY m.created_at DESC 
          LIMIT 10
        `,
          [roomId],
        );

        // Get room members
        const roomMembers = await db.all(
          `
          SELECT u.id, u.name, u.avatar_color 
          FROM users u 
          JOIN room_members rm ON u.id = rm.user_id 
          WHERE rm.room_id = ?
        `,
          [roomId],
        );

        // Create context for AI
        const context = {
          recentMessages: recentMessages.reverse(),
          roomMembers,
          currentMessage: content,
          roomId,
          userId,
        };

        // Call Mastra AI workflow
        const aiResponse = await callMastraAI(context);

        const aiMessage = {
          id: uuidv4(),
          roomId,
          userId: null,
          content: aiResponse,
          type: 'ai',
          createdAt: new Date().toISOString(),
          user: { id: 'ai', name: 'AI Assistant', avatarColor: '#4ECDC4' },
        };

        // Save AI message to database
        await db.run(
          'INSERT INTO messages (id, room_id, user_id, content, type, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [aiMessage.id, roomId, null, aiMessage.content, 'ai', aiMessage.createdAt],
        );

        // Broadcast AI response
        io.to(roomId).emit('new-message', aiMessage);
        socket.to(roomId).emit('ai-typing', { isTyping: false });
      } catch (error) {
        console.error('Error handling AI mention:', error);
        socket.emit('error', { message: 'Failed to process AI mention' });
        socket.to(data.roomId).emit('ai-typing', { isTyping: false });
      }
    });

    // Handle file upload
    socket.on('file-upload', async (data) => {
      try {
        const { roomId, userId, filename, fileSize } = data;
        console.log(`File upload from ${userId} in room ${roomId}: ${filename}`);

        // Create a file message
        const fileMessage = {
          id: uuidv4(),
          roomId,
          userId,
          content: `Uploaded file: ${filename}`,
          type: 'file',
          metadata: JSON.stringify({ filename, fileSize }),
          createdAt: new Date().toISOString(),
        };

        // Save file message to database
        await db.run(
          'INSERT INTO messages (id, room_id, user_id, content, type, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            fileMessage.id,
            roomId,
            userId,
            fileMessage.content,
            'file',
            fileMessage.metadata,
            fileMessage.createdAt,
          ],
        );

        // Get user info
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        // Broadcast file upload message
        const message = {
          ...fileMessage,
          user: user ? { id: user.id, name: user.name, avatarColor: user.avatar_color } : null,
        };

        io.to(roomId).emit('new-message', message);
        io.to(roomId).emit('file-uploaded', { filename, userId });
      } catch (error) {
        console.error('Error handling file upload:', error);
        socket.emit('error', { message: 'Failed to upload file' });
      }
    });

    // Handle voice messages
    socket.on('voice-message', async (data) => {
      try {
        const { roomId, userId, audioData } = data;
        console.log(`Voice message from ${userId} in room ${roomId}`);

        // Create a voice message
        const voiceMessage = {
          id: uuidv4(),
          roomId,
          userId,
          content: '[Voice Message]',
          type: 'voice',
          metadata: JSON.stringify({ audioData }),
          createdAt: new Date().toISOString(),
        };

        // Save voice message to database
        await db.run(
          'INSERT INTO messages (id, room_id, user_id, content, type, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            voiceMessage.id,
            roomId,
            userId,
            voiceMessage.content,
            'voice',
            voiceMessage.metadata,
            voiceMessage.createdAt,
          ],
        );

        // Get user info
        const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);

        // Broadcast voice message
        const message = {
          ...voiceMessage,
          user: user ? { id: user.id, name: user.name, avatarColor: user.avatar_color } : null,
        };

        io.to(roomId).emit('new-message', message);
      } catch (error) {
        console.error('Error handling voice message:', error);
        socket.emit('error', { message: 'Failed to process voice message' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      const { userId, roomId } = socket.data || {};
      console.log(`User ${userId} disconnected from room ${roomId}`);

      if (userId && roomId) {
        socket.to(roomId).emit('user-left', { userId });
      }
    });
  });

  return io;
}

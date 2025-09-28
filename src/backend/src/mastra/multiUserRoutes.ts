import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatarColor: z.string().optional(),
});

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  createdBy: z.string().min(1, 'Created by is required'),
});

const joinRoomSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
  userId: z.string().min(1, 'User ID is required'),
});

const generateAvatarColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0984E3', '#A29BFE', '#FD79A8'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const multiUserRoutes = {
  // Get or create user (for demo purposes)
  async getOrCreateUser(req: any, res: any) {
    try {
      const body = createUserSchema.parse(req.body);

      // Try to find existing user by name
      let user = await db.get(
        'SELECT * FROM users WHERE name = ?',
        [body.name]
      );

      if (!user) {
        // Create new user
        const userId = uuidv4();
        const avatarColor = body.avatarColor || generateAvatarColor();

        await db.run(
          'INSERT INTO users (id, name, avatar_color, created_at) VALUES (?, ?, ?, ?)',
          [userId, body.name, avatarColor, new Date().toISOString()]
        );

        user = {
          id: userId,
          name: body.name,
          avatar_color: avatarColor,
          created_at: new Date().toISOString()
        };
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          avatarColor: user.avatar_color,
          createdAt: user.created_at
        }
      });
    } catch (error) {
      console.error('Error getting or creating user:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get or create user'
      });
    }
  },

  // Create a new chat room
  async createRoom(req: any, res: any) {
    try {
      const body = createRoomSchema.parse(req.body);
      const roomId = uuidv4();
      const inviteCode = generateInviteCode();

      // Create room in database
      await db.run(
        'INSERT INTO chat_rooms (id, name, invite_code, created_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [roomId, body.name, inviteCode, body.createdBy, new Date().toISOString()]
      );

      // Add creator as room member
      await db.run(
        'INSERT INTO room_members (room_id, user_id, joined_at) VALUES (?, ?, ?)',
        [roomId, body.createdBy, new Date().toISOString()]
      );

      res.json({
        success: true,
        room: {
          id: roomId,
          name: body.name,
          inviteCode,
          createdBy: body.createdBy
        }
      });
    } catch (error) {
      console.error('Error creating room:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create room'
      });
    }
  },

  // Join a room by invite code
  async joinRoom(req: any, res: any) {
    try {
      const body = joinRoomSchema.parse(req.body);

      // Find room by invite code
      const room = await db.get(
        'SELECT * FROM chat_rooms WHERE invite_code = ?',
        [body.inviteCode]
      );

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      // Check if user is already a member
      const existingMember = await db.get(
        'SELECT * FROM room_members WHERE room_id = ? AND user_id = ?',
        [room.id, body.userId]
      );

      if (!existingMember) {
        // Add user to room
        await db.run(
          'INSERT INTO room_members (room_id, user_id, joined_at) VALUES (?, ?, ?)',
          [room.id, body.userId, new Date().toISOString()]
        );
      }

      res.json({
        success: true,
        room: {
          id: room.id,
          name: room.name,
          inviteCode: room.invite_code,
          createdBy: room.created_by
        }
      });
    } catch (error) {
      console.error('Error joining room:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to join room'
      });
    }
  }
};

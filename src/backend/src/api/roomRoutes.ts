import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';

const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  createdBy: z.string().min(1, 'Created by is required'),
});

const joinRoomSchema = z.object({
  inviteCode: z.string().min(1, 'Invite code is required'),
  userId: z.string().min(1, 'User ID is required'),
});

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const roomRoutes = {
  // Create a new chat room
  'POST /chat/rooms/create': async (req: any, res: any) => {
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
  'POST /chat/rooms/join': async (req: any, res: any) => {
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
  },

  // Get room details
  'GET /chat/rooms/:id': async (req: any, res: any) => {
    try {
      const roomId = req.params.id;

      const room = await db.get(
        'SELECT * FROM chat_rooms WHERE id = ?',
        [roomId]
      );

      if (!room) {
        return res.status(404).json({
          success: false,
          error: 'Room not found'
        });
      }

      // Get room members
      const members = await db.all(
        'SELECT u.id, u.name, u.avatar_color, rm.joined_at FROM room_members rm JOIN users u ON rm.user_id = u.id WHERE rm.room_id = ?',
        [roomId]
      );

      res.json({
        success: true,
        room: {
          id: room.id,
          name: room.name,
          inviteCode: room.invite_code,
          createdBy: room.created_by,
          members
        }
      });
    } catch (error) {
      console.error('Error getting room:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get room details'
      });
    }
  },

  // Get room members
  'GET /chat/rooms/:id/members': async (req: any, res: any) => {
    try {
      const roomId = req.params.id;

      const members = await db.all(
        'SELECT u.id, u.name, u.avatar_color, rm.joined_at FROM room_members rm JOIN users u ON rm.user_id = u.id WHERE rm.room_id = ? ORDER BY rm.joined_at',
        [roomId]
      );

      res.json({
        success: true,
        members
      });
    } catch (error) {
      console.error('Error getting room members:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get room members'
      });
    }
  }
};

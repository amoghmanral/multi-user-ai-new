import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatarColor: z.string().optional(),
});

const generateAvatarColor = (): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0984E3', '#A29BFE', '#FD79A8'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const userRoutes = {
  // Create a new user
  'POST /chat/users/create': async (req: any, res: any) => {
    try {
      const body = createUserSchema.parse(req.body);
      const userId = uuidv4();
      const avatarColor = body.avatarColor || generateAvatarColor();

      // Create user in database
      await db.run(
        'INSERT INTO users (id, name, avatar_color, created_at) VALUES (?, ?, ?, ?)',
        [userId, body.name, avatarColor, new Date().toISOString()]
      );

      res.json({
        success: true,
        user: {
          id: userId,
          name: body.name,
          avatarColor
        }
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      });
    }
  },

  // Get user details
  'GET /chat/users/:id': async (req: any, res: any) => {
    try {
      const userId = req.params.id;

      const user = await db.get(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
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
      console.error('Error getting user:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user details'
      });
    }
  },

  // Get or create user (for demo purposes)
  'POST /chat/users/get-or-create': async (req: any, res: any) => {
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
  }
};

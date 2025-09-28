import { db } from '../database';

export interface RoomContext {
  roomId: string;
  roomName: string;
  recentMessages: Array<{
    id: string;
    content: string;
    type: string;
    userId?: string;
    userName?: string;
    avatarColor?: string;
    createdAt: string;
    metadata?: any;
  }>;
  uploadedFiles: Array<{
    id: string;
    filename: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    createdAt: string;
    content?: string;
  }>;
  roomMembers: Array<{
    id: string;
    name: string;
    avatarColor: string;
    joinedAt: string;
  }>;
}

export class ContextService {
  /**
   * Build comprehensive context for AI interactions in a room
   */
  static async buildRoomContext(roomId: string, limit: number = 20): Promise<RoomContext> {
    try {
      // Get room information
      const room = await db.get(
        'SELECT * FROM chat_rooms WHERE id = ?',
        [roomId]
      );

      if (!room) {
        throw new Error(`Room ${roomId} not found`);
      }

      // Get recent messages with user information
      const messages = await db.all(
        `SELECT 
          m.id, m.content, m.type, m.metadata, m.created_at,
          u.name as user_name, u.avatar_color
        FROM messages m 
        LEFT JOIN users u ON m.user_id = u.id 
        WHERE m.room_id = ? 
        ORDER BY m.created_at DESC 
        LIMIT ?`,
        [roomId, limit]
      );

      // Get uploaded files
      const files = await db.all(
        `SELECT 
          uf.id, uf.filename, uf.file_size, uf.mime_type, uf.created_at,
          u.name as uploaded_by
        FROM uploaded_files uf 
        JOIN users u ON uf.user_id = u.id 
        WHERE uf.room_id = ? 
        ORDER BY uf.created_at DESC`,
        [roomId]
      );

      // Get room members
      const members = await db.all(
        `SELECT 
          u.id, u.name, u.avatar_color, rm.joined_at
        FROM room_members rm 
        JOIN users u ON rm.user_id = u.id 
        WHERE rm.room_id = ? 
        ORDER BY rm.joined_at`,
        [roomId]
      );

      return {
        roomId: room.id,
        roomName: room.name,
        recentMessages: messages.reverse().map(msg => ({
          id: msg.id,
          content: msg.content,
          type: msg.type,
          userId: msg.user_id,
          userName: msg.user_name,
          avatarColor: msg.avatar_color,
          createdAt: msg.created_at,
          metadata: msg.metadata ? JSON.parse(msg.metadata) : null
        })),
        uploadedFiles: files.map(file => ({
          id: file.id,
          filename: file.filename,
          fileSize: file.file_size,
          mimeType: file.mime_type,
          uploadedBy: file.uploaded_by,
          createdAt: file.created_at,
          content: this.extractFileContent(file)
        })),
        roomMembers: members.map(member => ({
          id: member.id,
          name: member.name,
          avatarColor: member.avatar_color,
          joinedAt: member.joined_at
        }))
      };
    } catch (error) {
      console.error('Error building room context:', error);
      throw error;
    }
  }

  /**
   * Extract content from file metadata for AI context
   */
  private static extractFileContent(file: any): string {
    try {
      // For now, we'll return a placeholder
      // In a real implementation, you'd extract actual file content
      return `[${file.mime_type} file: ${file.filename}]`;
    } catch (error) {
      return `[File: ${file.filename}]`;
    }
  }

  /**
   * Build system prompt for multi-user chat context
   */
  static buildSystemPrompt(context: RoomContext, currentUserId?: string): string {
    const members = context.roomMembers.map(m => m.name).join(', ');
    const recentMessages = context.recentMessages
      .slice(-10) // Last 10 messages for context
      .map(msg => {
        const sender = msg.userName || 'AI Assistant';
        return `${sender}: ${msg.content}`;
      })
      .join('\n');

    const uploadedFiles = context.uploadedFiles.length > 0 
      ? `\n\nUploaded files in this room:\n${context.uploadedFiles.map(f => `- ${f.filename} (uploaded by ${f.uploadedBy})`).join('\n')}`
      : '';

    return `You are an AI assistant participating in a multi-user chat room called "${context.roomName}".

ROOM CONTEXT:
- Room: ${context.roomName}
- Participants: ${members}
- Total messages: ${context.recentMessages.length}
- Uploaded files: ${context.uploadedFiles.length}

RECENT CONVERSATION:
${recentMessages}${uploadedFiles}

INSTRUCTIONS:
1. You are a helpful AI assistant that can participate naturally in group conversations
2. You can reference uploaded files and previous messages when relevant
3. Address users by name when appropriate
4. Provide helpful suggestions and insights
5. If asked about files, summarize their content or provide relevant information
6. Keep responses conversational and appropriate for a group chat
7. Use @username format when mentioning specific users
8. Be concise but informative

Current user context: ${currentUserId ? `You are responding to user ${currentUserId}` : 'General room message'}`;
  }

  /**
   * Check if a message mentions the AI
   */
  static isAIMention(message: string): boolean {
    const aiMentions = ['@ai', '@assistant', '@bot', 'ai', 'assistant'];
    return aiMentions.some(mention => 
      message.toLowerCase().includes(mention.toLowerCase())
    );
  }

  /**
   * Extract mentioned users from a message
   */
  static extractMentions(message: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1]);
    }
    
    return mentions;
  }
}

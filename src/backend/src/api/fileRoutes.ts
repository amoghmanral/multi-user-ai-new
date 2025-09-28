import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { db } from '../database';

const uploadSchema = z.object({
  roomId: z.string().min(1, 'Room ID is required'),
  userId: z.string().min(1, 'User ID is required'),
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = join(process.cwd(), 'uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/plain', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv', 'application/json'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Helper function to extract text from files
const extractFileContent = async (filePath: string, mimeType: string): Promise<string> => {
  try {
    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
      return readFileSync(filePath, 'utf-8');
    } else if (mimeType === 'application/pdf') {
      // For PDF files, we'll just return a placeholder for now
      // In a real implementation, you'd use a PDF parsing library
      return '[PDF Content - would need PDF parsing library]';
    } else if (mimeType.startsWith('image/')) {
      return `[Image file: ${filePath}]`;
    } else {
      return `[Binary file: ${filePath}]`;
    }
  } catch (error) {
    console.error('Error extracting file content:', error);
    return `[Error reading file: ${filePath}]`;
  }
};

export const fileRoutes = {
  // Upload file middleware
  uploadMiddleware: upload.single('file'),

  // Upload a file
  'POST /chat/files/upload': async (req: any, res: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const { roomId, userId } = uploadSchema.parse(req.body);
      const fileId = uuidv4();

      // Create uploads directory structure: uploads/{roomId}/{userId}/
      const roomDir = join(process.cwd(), 'uploads', roomId);
      const userDir = join(roomDir, userId);
      
      // In a real implementation, you'd create these directories and move the file
      // For now, we'll just use the file path from multer

      // Extract file content for AI context
      const fileContent = await extractFileContent(req.file.path, req.file.mimetype);

      // Save file info to database
      await db.run(
        'INSERT INTO uploaded_files (id, room_id, user_id, filename, filepath, file_size, mime_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          fileId,
          roomId,
          userId,
          req.file.originalname,
          req.file.path,
          req.file.size,
          req.file.mimetype,
          new Date().toISOString()
        ]
      );

      // Save file content as a message for AI context
      await db.run(
        'INSERT INTO messages (id, room_id, user_id, content, type, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          uuidv4(),
          roomId,
          userId,
          `📁 File uploaded: ${req.file.originalname}`,
          'file',
          JSON.stringify({
            fileId,
            filename: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
            content: fileContent.substring(0, 1000) // Limit content for metadata
          }),
          new Date().toISOString()
        ]
      );

      res.json({
        success: true,
        file: {
          id: fileId,
          filename: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          content: fileContent.substring(0, 500) // Return preview
        }
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file'
      });
    }
  },

  // Get files for a room
  'GET /chat/files/:roomId': async (req: any, res: any) => {
    try {
      const roomId = req.params.roomId;

      const files = await db.all(
        'SELECT uf.*, u.name as user_name FROM uploaded_files uf JOIN users u ON uf.user_id = u.id WHERE uf.room_id = ? ORDER BY uf.created_at DESC',
        [roomId]
      );

      res.json({
        success: true,
        files: files.map(file => ({
          id: file.id,
          filename: file.filename,
          fileSize: file.file_size,
          mimeType: file.mime_type,
          uploadedBy: file.user_name,
          createdAt: file.created_at
        }))
      });
    } catch (error) {
      console.error('Error getting files:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get files'
      });
    }
  },

  // Download a file
  'GET /chat/files/:id/download': async (req: any, res: any) => {
    try {
      const fileId = req.params.id;

      const file = await db.get(
        'SELECT * FROM uploaded_files WHERE id = ?',
        [fileId]
      );

      if (!file) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      // In a real implementation, you'd stream the file
      // For now, we'll just return the file info
      res.json({
        success: true,
        file: {
          id: file.id,
          filename: file.filename,
          fileSize: file.file_size,
          mimeType: file.mime_type,
          filepath: file.filepath
        }
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to download file'
      });
    }
  }
};

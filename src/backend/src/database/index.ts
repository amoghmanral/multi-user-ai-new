import Database from 'sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

class DatabaseManager {
  private db: Database.Database;
  private isInitialized = false;

  constructor() {
    const dbPath = join(process.cwd(), 'storage.db');
    this.db = new Database.Database(dbPath);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('Initializing database...');
      
      // Create tables one by one to avoid SQL execution issues
      const tables = [
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          avatar_color TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS chat_rooms (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          invite_code TEXT UNIQUE NOT NULL,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS room_members (
          room_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (room_id, user_id)
        )`,
        
        `CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          user_id TEXT,
          content TEXT NOT NULL,
          type TEXT DEFAULT 'text',
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS uploaded_files (
          id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          user_id TEXT NOT NULL,
          filename TEXT NOT NULL,
          filepath TEXT NOT NULL,
          file_size INTEGER,
          mime_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
      ];

      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id)',
        'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)',
        'CREATE INDEX IF NOT EXISTS idx_room_members_room_id ON room_members(room_id)',
        'CREATE INDEX IF NOT EXISTS idx_room_members_user_id ON room_members(user_id)',
        'CREATE INDEX IF NOT EXISTS idx_uploaded_files_room_id ON uploaded_files(room_id)'
      ];

      // Execute table creation statements
      for (const tableSQL of tables) {
        console.log('Creating table:', tableSQL.split('(')[0].replace('CREATE TABLE IF NOT EXISTS ', ''));
        await this.run(tableSQL);
      }

      // Execute index creation statements
      for (const indexSQL of indexes) {
        console.log('Creating index:', indexSQL.split('(')[0].replace('CREATE INDEX IF NOT EXISTS ', ''));
        await this.run(indexSQL);
      }
      
      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  async run(sql: string, params: any[] = []): Promise<Database.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close(): void {
    this.db.close();
  }
}

export const db = new DatabaseManager();

import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { openai } from '@ai-sdk/openai';

const storage = new LibSQLStore({
  url: 'file:./storage.db', // Local SQLite database file
});

const vector = new LibSQLVector({
  connectionUrl: 'file:./storage.db', // Same database for vectors
});

export const memory = new Memory({
  storage,
  vector,
  embedder: openai.embedding('text-embedding-3-small'), // For semantic recall
  options: {
    // Keep more recent messages for better context
    lastMessages: 20,
    
    // Enable semantic recall for RAG-based conversation history
    semanticRecall: {
      topK: 5, // Retrieve 5 most similar messages
      messageRange: 3, // Include 3 messages before and after each match
      scope: 'resource', // Search across all conversations for the same user
    },
    
    // Enable working memory to remember user context
    workingMemory: {
      enabled: true,
      scope: 'resource', // Remember users across all conversations
      template: `# Multi-User Chat Context

## Current User
- **Name**: 
- **Role**: 
- **Interests**: 
- **Current Topic**: 

## Room Context
- **Room Name**: 
- **Other Users**: 
- **Conversation Theme**: 

## Conversation Summary
- **Key Topics Discussed**: 
- **Important Decisions**: 
- **Questions Asked**: 
- **Answers Provided**: 

## User Preferences
- **Communication Style**: 
- **Technical Level**: 
- **Helpful Responses**: `,
    },
    
    // Auto-generate thread titles for better organization
    threads: {
      generateTitle: true,
    },
  },
});

export { storage };

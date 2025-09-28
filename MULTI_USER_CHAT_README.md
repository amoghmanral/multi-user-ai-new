# Multi-User Live AI Chat with Cedar OS

A complete multi-user real-time AI chat application built with Cedar OS framework and Mastra backend for hackathon demonstrations.

## 🚀 Features

- **Real-time Multi-User Chat**: Multiple users can join the same room and chat in real-time
- **Cedar OS Spells**: Gesture-based interactions with radial menus and text selection actions
- **Voice Integration**: Voice messages that broadcast to all room members with AI transcription
- **File Sharing**: Upload files that become part of AI context and are accessible to all users
- **AI Context Management**: AI understands room history, uploaded files, and user interactions
- **Demo-Ready**: Optimized for hackathon presentations with multiple browser support

## 🛠 Technology Stack

### Frontend
- **Cedar OS**: React-based AI framework with built-in components
- **Socket.io Client**: Real-time communication
- **Tailwind CSS**: Styling (built into Cedar OS)
- **Next.js**: React framework

### Backend
- **Mastra**: AI backend framework
- **Socket.io Server**: Real-time messaging
- **SQLite**: File-based database (no setup required)
- **Express**: HTTP server
- **Multer**: File upload handling

## 📋 Prerequisites

- Node.js >= 20.9.0
- npm or pnpm
- OpenAI API key (for AI functionality)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd src/backend
npm install
cd ../..
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
# OpenAI API Key (required for AI functionality)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Custom ports
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

### 3. Start the Application

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
# Frontend (port 3000)
npm run dev:next

# Backend (port 8080)
npm run dev:server
```

### 4. Access the Application

- **Main Cedar OS Demo**: http://localhost:3000
- **Multi-User Chat**: http://localhost:3000/multi-user-chat

## 🎯 Demo Instructions

### Setup Demo
1. Open 3 browser windows/tabs to simulate different users
2. Navigate to the multi-user chat page in all windows
3. Create user profiles with different names (Alice, Bob, Charlie)
4. Create a room in Window 1, share invite code with others
5. Join the same room from all windows

### Feature Demonstrations

#### Real-time Messaging
- Type messages in different windows
- Show real-time updates and typing indicators
- Demonstrate message history and persistence

#### AI Integration
- Use `@ai` mentions to get AI responses
- Upload files and ask AI about them
- Show AI referencing conversation history and files

#### Cedar OS Spells
- Press `Ctrl+K` for Quick Actions radial menu
- Select text to see tooltip menu with AI actions
- Demonstrate gesture-based interactions

#### Voice Features
- Enable voice input and grant microphone permissions
- Record voice messages that transcribe and broadcast
- Show AI responding with voice when appropriate

#### File Sharing
- Upload various file types (PDF, images, documents)
- Ask AI about uploaded files
- Show file organization and sharing across users

## 🏗 Architecture

### Frontend Structure
```
src/
├── components/
│   └── multiUserChat/
│       ├── MultiUserChatProvider.tsx    # Context and state management
│       ├── MultiUserChatInterface.tsx   # Main chat interface
│       ├── UserSetup.tsx               # User profile creation
│       ├── RoomManager.tsx             # Room creation and joining
│       ├── VoiceIntegration.tsx        # Cedar OS voice features
│       ├── DemoInstructions.tsx        # Demo guide modal
│       └── spells/
│           └── MultiUserChatSpells.tsx # Cedar OS spells integration
└── app/
    └── multi-user-chat/
        └── page.tsx                    # Multi-user chat page
```

### Backend Structure
```
src/backend/
├── src/
│   ├── database/
│   │   ├── schema.sql                  # SQLite database schema
│   │   └── index.ts                    # Database manager
│   ├── socket/
│   │   └── socketServer.ts             # Socket.io server setup
│   ├── api/
│   │   ├── roomRoutes.ts               # Room management APIs
│   │   ├── userRoutes.ts               # User management APIs
│   │   └── fileRoutes.ts               # File upload APIs
│   ├── services/
│   │   └── contextService.ts           # AI context management
│   └── mastra/
│       ├── workflows/
│       │   └── chatWorkflow.ts         # Enhanced AI workflow
│       └── index.ts                    # Mastra configuration
└── server.ts                           # Express server with Socket.io
```

## 🔧 Configuration

### Database
- SQLite database is created automatically at `src/backend/storage.db`
- No additional setup required
- Database schema includes: users, chat_rooms, room_members, messages, uploaded_files

### File Storage
- Uploaded files stored in `src/backend/uploads/`
- Organized by room and user: `uploads/{roomId}/{userId}/`
- Supported formats: images, PDFs, text files, documents

### Socket.io Events
- `join-room`: User joins a chat room
- `leave-room`: User leaves a chat room
- `send-message`: Send message to room
- `new-message`: Receive new message
- `user-joined`: Notify when user joins
- `user-left`: Notify when user leaves
- `ai-typing`: Show AI is generating response
- `file-uploaded`: Notify file upload
- `voice-message`: Handle voice messages

## 🎨 Cedar OS Integration

### Spells Implemented
- **QuickActionsSpell**: Radial menu with `Ctrl+K` for quick actions
- **TooltipMenuSpell**: Text selection actions for AI interactions

### Voice Integration
- Uses Cedar OS `useVoice` hook
- Integrates with Mastra backend voice endpoints
- Supports multiple languages and voice settings

### Components Used
- `FloatingCedarChat`: Chat interface components
- `VoiceIndicator`: Voice status visualization
- `Container3D`: 3D styled containers
- `RadialMenuSpell`: Gesture-based radial menus
- `TooltipMenuSpell`: Context-aware tooltip menus

## 🚀 Production Deployment

### Environment Variables
```env
NODE_ENV=production
OPENAI_API_KEY=your_production_key
DATABASE_URL=your_database_url
UPLOAD_DIR=/path/to/uploads
```

### Build Commands
```bash
# Build frontend
npm run build

# Build backend
cd src/backend
npm run build
```

## 🐛 Troubleshooting

### Common Issues

1. **Socket.io Connection Failed**
   - Ensure backend is running on port 8080
   - Check CORS configuration
   - Verify firewall settings

2. **Voice Not Working**
   - Grant microphone permissions in browser
   - Check browser compatibility (Chrome/Edge recommended)
   - Verify voice endpoint configuration

3. **File Upload Fails**
   - Check file size limits (10MB default)
   - Verify supported file types
   - Ensure uploads directory exists

4. **AI Not Responding**
   - Verify OpenAI API key is set
   - Check API quota and billing
   - Review console for error messages

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=mastra:*
LOG_LEVEL=debug
```

## 📝 API Endpoints

### Room Management
- `POST /chat/rooms/create` - Create new room
- `POST /chat/rooms/join` - Join room by invite code
- `GET /chat/rooms/:id` - Get room details
- `GET /chat/rooms/:id/members` - Get room members

### User Management
- `POST /chat/users/create` - Create new user
- `GET /chat/users/:id` - Get user details
- `POST /chat/users/get-or-create` - Get or create user

### File Management
- `POST /chat/files/upload` - Upload file
- `GET /chat/files/:roomId` - Get room files
- `GET /chat/files/:id/download` - Download file

### AI Chat
- `POST /chat/stream` - Streaming AI chat
- `POST /chat/voice-execute` - Voice chat execution

## 🤝 Contributing

This is a hackathon demo project. For production use, consider:
- Adding authentication and authorization
- Implementing proper error handling
- Adding comprehensive testing
- Optimizing for performance and scalability
- Adding monitoring and logging

## 📄 License

This project is created for hackathon demonstration purposes.

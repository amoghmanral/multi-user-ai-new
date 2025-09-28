'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

// Types
export interface User {
  id: string;
  name: string;
  avatarColor: string;
  createdAt?: string;
}

export interface Room {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  roomId: string;
  userId: string | null;
  content: string;
  type: 'text' | 'file' | 'voice' | 'ai';
  metadata?: string;
  createdAt: string;
  user?: User | null;
}

// Context
interface MultiUserChatContextType {
  // State
  currentUser: User | null;
  currentRoom: Room | null;
  messages: Message[];
  members: User[];
  socket: Socket | null;
  isConnected: boolean;
  isVoiceEnabled: boolean;
  aiTyping: boolean;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setCurrentRoom: (room: Room | null) => void;
  createRoom: (name: string) => Promise<Room>;
  joinRoom: (inviteCode: string) => Promise<Room>;
  sendMessage: (content: string, messageType?: string) => void;
  uploadFile: (file: File) => Promise<void>;
  leaveRoom: () => void;
  setVoiceEnabled: (enabled: boolean) => void;
  addMessage: (message: Omit<Message, 'id'>) => void;
  clearAllData: () => void;
}

const MultiUserChatContext = createContext<MultiUserChatContextType | undefined>(undefined);

export const useMultiUserChat = () => {
  const context = useContext(MultiUserChatContext);
  if (!context) {
    throw new Error('useMultiUserChat must be used within a MultiUserChatProvider');
  }
  return context;
};

interface MultiUserChatProviderProps {
  children: ReactNode;
}

export const MultiUserChatProvider: React.FC<MultiUserChatProviderProps> = ({ children }) => {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('multiUserChat_user');
    const savedRoom = localStorage.getItem('multiUserChat_room');
    const savedMessages = localStorage.getItem('multiUserChat_messages');
    const savedMembers = localStorage.getItem('multiUserChat_members');

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        console.log('Loaded saved user:', user);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
      }
    }

    if (savedRoom) {
      try {
        const room = JSON.parse(savedRoom);
        setCurrentRoom(room);
        console.log('Loaded saved room:', room);
      } catch (error) {
        console.error('Failed to parse saved room:', error);
      }
    }

    if (savedMessages) {
      try {
        const messages = JSON.parse(savedMessages);
        setMessages(messages);
        console.log('Loaded saved messages:', messages.length);
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
      }
    } else {
      // If no room-specific messages, try general messages
      const generalMessages = localStorage.getItem('multiUserChat_messages');
      if (generalMessages) {
        try {
          const messages = JSON.parse(generalMessages);
          setMessages(messages);
          console.log('Loaded general messages:', messages.length);
        } catch (error) {
          console.error('Failed to parse general messages:', error);
        }
      }
    }

    if (savedMembers) {
      try {
        const members = JSON.parse(savedMembers);
        setMembers(members);
        console.log('Loaded saved members:', members);
      } catch (error) {
        console.error('Failed to parse saved members:', error);
      }
    }
  }, []);

  // Save state to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('multiUserChat_user', JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentRoom) {
      localStorage.setItem('multiUserChat_room', JSON.stringify(currentRoom));
    }
  }, [currentRoom]);

  useEffect(() => {
    if (currentRoom) {
      localStorage.setItem(`multiUserChat_messages_${currentRoom.id}`, JSON.stringify(messages));
    }
    localStorage.setItem('multiUserChat_messages', JSON.stringify(messages));
  }, [messages, currentRoom]);

  useEffect(() => {
    localStorage.setItem('multiUserChat_members', JSON.stringify(members));
  }, [members]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://128.61.119.144:4111', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
      setSocket(newSocket);
      setIsConnected(true);
      
      // Join the room if we have a current room and user
      if (currentRoom && currentUser) {
        console.log('Joining room:', currentRoom.id, 'as user:', currentUser.id);
        newSocket.emit('join-room', {
          roomId: currentRoom.id,
          userId: currentUser.id
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
      setSocket(null);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('new-message', (message: Message) => {
      console.log('📨 New message received:', message);
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user-joined', (data: { userId: string; user: User }) => {
      console.log('👤 User joined:', data);
      setMembers(prev => [...prev, data.user]);
    });

    newSocket.on('user-left', (data: { userId: string }) => {
      console.log('👋 User left:', data);
      setMembers(prev => prev.filter(member => member.id !== data.userId));
    });

    newSocket.on('room-members', (members: User[]) => {
      console.log('👥 Room members:', members);
      setMembers(members);
    });

    newSocket.on('ai-typing', (data: { isTyping: boolean }) => {
      setAiTyping(data.isTyping);
    });

    newSocket.on('file-uploaded', (data: { filename: string; userId: string }) => {
      console.log('📁 File uploaded:', data);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Join room when current room or user changes
  useEffect(() => {
    if (socket && currentRoom && currentUser && isConnected) {
      console.log('🔄 Joining room:', currentRoom.id, 'as user:', currentUser.id);
      socket.emit('join-room', {
        roomId: currentRoom.id,
        userId: currentUser.id
      });
      
      // Load recent messages from database
      loadRecentMessages(currentRoom.id);
    }
  }, [socket, currentRoom, currentUser, isConnected]);

  // Function to load recent messages
  const loadRecentMessages = async (roomId: string) => {
    try {
      // For now, we'll just load from localStorage
      // In a real implementation, you'd fetch from the server
      const savedMessages = localStorage.getItem(`multiUserChat_messages_${roomId}`);
      if (savedMessages) {
        try {
          const messages = JSON.parse(savedMessages);
          setMessages(messages);
          console.log('📜 Loaded saved messages:', messages.length);
        } catch (error) {
          console.error('Failed to parse saved messages:', error);
        }
      }
    } catch (error) {
      console.error('Error loading recent messages:', error);
    }
  };

  // API functions
  const createRoom = async (name: string): Promise<Room> => {
    if (!currentUser) throw new Error('No user logged in');

    const response = await fetch('http://128.61.119.144:4111/chat/rooms/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        createdBy: currentUser.id
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to create room');
    }

    const room = data.room;
    setCurrentRoom(room);
    setMessages([]);
    setMembers([currentUser]);
    
    return room;
  };

  const joinRoom = async (inviteCode: string): Promise<Room> => {
    if (!currentUser) throw new Error('No user logged in');

    const response = await fetch('http://128.61.119.144:4111/chat/rooms/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        inviteCode,
        userId: currentUser.id
      })
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to join room');
    }

    const room = data.room;
    setCurrentRoom(room);
    setMessages([]);
    setMembers([currentUser]);
    
    return room;
  };

  const sendMessage = (content: string, messageType: string = 'text') => {
    if (!socket || !currentRoom || !currentUser || !content.trim()) return;

    console.log('📤 Sending message:', content);
    socket.emit('send-message', {
      roomId: currentRoom.id,
      userId: currentUser.id,
      content: content.trim(),
      messageType
    });
  };

  const uploadFile = async (file: File): Promise<void> => {
    if (!socket || !currentRoom || !currentUser) return;

    console.log('📁 Uploading file:', file.name);
    
    // Emit file upload event to socket
    socket.emit('file-upload', {
      roomId: currentRoom.id,
      userId: currentUser.id,
      filename: file.name,
      fileSize: file.size
    });

    // Also send as a regular message for now
    sendMessage(`📎 Uploaded file: ${file.name}`, 'file');
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.emit('leave-room', { roomId: currentRoom.id });
    }
    setCurrentRoom(null);
    setMessages([]);
    setMembers([]);
    
    // Clear persisted state
    localStorage.removeItem('multiUserChat_room');
    localStorage.removeItem('multiUserChat_messages');
    if (currentRoom) {
      localStorage.removeItem(`multiUserChat_messages_${currentRoom.id}`);
    }
    localStorage.removeItem('multiUserChat_members');
  };

  const addMessage = (message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const setVoiceEnabled = (enabled: boolean) => {
    setIsVoiceEnabled(enabled);
  };

  const clearAllData = () => {
    setCurrentUser(null);
    setCurrentRoom(null);
    setMessages([]);
    setMembers([]);
    
    // Clear all persisted state
    localStorage.removeItem('multiUserChat_user');
    localStorage.removeItem('multiUserChat_room');
    localStorage.removeItem('multiUserChat_messages');
    localStorage.removeItem('multiUserChat_members');
    
    // Clear room-specific messages
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('multiUserChat_messages_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const value: MultiUserChatContextType = {
    // State
    currentUser,
    currentRoom,
    messages,
    members,
    socket,
    isConnected,
    isVoiceEnabled,
    aiTyping,
    
    // Actions
    setCurrentUser,
    setCurrentRoom,
    createRoom,
    joinRoom,
    sendMessage,
    uploadFile,
    leaveRoom,
    setVoiceEnabled,
    addMessage,
    clearAllData
  };

  return (
    <MultiUserChatContext.Provider value={value}>
      {children}
    </MultiUserChatContext.Provider>
  );
};
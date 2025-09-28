'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMultiUserChat } from './MultiUserChatProvider';
import { RoomManager } from './RoomManager';
import { MultiUserChatSpells } from './spells/MultiUserChatSpells';
import { VoiceIntegration } from './VoiceIntegration';
import { DemoInstructions } from './DemoInstructions';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Users, 
  Settings,
  MessageSquare,
  Bot,
  FileText,
  HelpCircle
} from 'lucide-react';

interface MultiUserChatInterfaceProps {}

export const MultiUserChatInterface: React.FC<MultiUserChatInterfaceProps> = () => {
  const [showRoomManager, setShowRoomManager] = useState(true);
  const [messageInput, setMessageInput] = useState('');
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showDemoInstructions, setShowDemoInstructions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    currentUser,
    currentRoom,
    messages,
    members,
    isConnected,
    isVoiceEnabled,
    aiTyping,
    sendMessage,
    uploadFile,
    leaveRoom,
    clearAllData
  } = useMultiUserChat();

  // Don't auto-enter chat - let user choose what to do
  // This allows users to see their current room and choose to continue or start fresh

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await uploadFile(file);
        setShowFileUpload(false);
      } catch (error) {
        console.error('Failed to upload file:', error);
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'ai':
        return <Bot className="w-4 h-4" />;
      case 'file':
        return <FileText className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  if (showRoomManager) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <RoomManager onRoomJoin={() => setShowRoomManager(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Cedar OS Spells */}
      <MultiUserChatSpells />
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentRoom?.name}</h1>
                <p className="text-sm text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'} • {members?.filter((user, index, self) => 
                    index === self.findIndex(u => u.id === user.id)
                  ).length || 0} members
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Voice Integration */}
            <VoiceIntegration />

            {/* Room Members */}
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <div className="flex -space-x-2">
                {members?.filter((user, index, self) => 
                  // Remove duplicates by checking if this is the first occurrence of this user ID
                  index === self.findIndex(u => u.id === user.id)
                ).slice(0, 3).map((user) => (
                  <div
                    key={user.id}
                    className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: user.avatarColor }}
                    title={user.name}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {members && members.filter((user, index, self) => 
                  index === self.findIndex(u => u.id === user.id)
                ).length > 3 && (
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-400 flex items-center justify-center text-white text-xs font-bold">
                    +{members.filter((user, index, self) => 
                      index === self.findIndex(u => u.id === user.id)
                    ).length - 3}
                  </div>
                )}
              </div>
            </div>

            {/* Demo Instructions */}
            <button
              onClick={() => setShowDemoInstructions(true)}
              className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              title="Demo instructions"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Add Others / Room Settings */}
            <button
              onClick={() => setShowRoomManager(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Add others / Room settings"
            >
              <Users className="w-5 h-5" />
            </button>

            {/* Leave Room */}
            <button
              onClick={() => {
                leaveRoom();
                setShowRoomManager(true); // Return to room manager instead of reloading
              }}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
              title="Leave Room"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start the conversation by sending a message!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.userId === currentUser?.id ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {message.user ? (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: message.user.avatarColor }}
                  >
                    {message.user.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                    {getMessageIcon(message.type)}
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div className={`max-w-xs lg:max-w-md ${
                message.userId === currentUser?.id ? 'text-right' : ''
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {message.user ? message.user.name : 'AI Assistant'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message.createdAt)}
                  </span>
                </div>
                
                <div className={`rounded-lg px-4 py-2 ${
                  message.type === 'ai' 
                    ? 'bg-blue-100 text-blue-900' 
                    : message.type === 'file'
                    ? 'bg-green-100 text-green-900'
                    : message.userId === currentUser?.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  {message.metadata && message.type === 'file' && (
                    <p className="text-xs mt-1 opacity-75">
                      📁 {message.metadata}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* AI Typing Indicator */}
        {aiTyping && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <div className="bg-blue-100 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-blue-600">AI is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Demo Instructions Modal */}
      {showDemoInstructions && (
        <DemoInstructions onClose={() => setShowDemoInstructions(false)} />
      )}

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          {/* File Upload Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Upload file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,application/pdf,text/*,.doc,.docx"
          />

          {/* Message Input */}
          <div className="flex-1">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!messageInput.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

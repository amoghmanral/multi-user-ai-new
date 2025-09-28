'use client';

import React, { useState } from 'react';
import { useMultiUserChat } from './MultiUserChatProvider';
import { Users, Plus, Hash, Copy, Check } from 'lucide-react';

interface RoomManagerProps {
  onRoomJoin: () => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({ onRoomJoin }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { createRoom, joinRoom, currentRoom, members, clearAllData } = useMultiUserChat();

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      await createRoom(roomName.trim());
      onRoomJoin();
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;

    try {
      await joinRoom(inviteCode.trim().toUpperCase());
      onRoomJoin();
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const copyInviteCode = async () => {
    if (currentRoom?.inviteCode) {
      try {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(currentRoom.inviteCode);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          // Fallback for older browsers or non-HTTPS
          const textArea = document.createElement('textarea');
          textArea.value = currentRoom.inviteCode;
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          try {
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
            // Show the code in an alert as last resort
            alert(`Invite Code: ${currentRoom.inviteCode}`);
          }
          document.body.removeChild(textArea);
        }
      } catch (error) {
        console.error('Failed to copy invite code:', error);
        // Show the code in an alert as fallback
        alert(`Invite Code: ${currentRoom.inviteCode}`);
      }
    }
  };

  if (currentRoom) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#A8C3A0] rounded-full flex items-center justify-center mx-auto mb-4">
            <Hash className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Welcome Back!</h2>
          <p className="text-[#2D2D2D]/70">You're currently in a chat room</p>
        </div>

        <div className="bg-[#FAF9F6] rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold text-[#2D2D2D]">{currentRoom.name}</h3>
              <p className="text-sm text-[#2D2D2D]/60">Room ID: {currentRoom.inviteCode}</p>
            </div>
            <button
              onClick={copyInviteCode}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#A8C3A0] hover:bg-[#9BB396] text-white rounded-lg transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Invite</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-[#A8C3A0]" />
          <span className="text-sm font-medium text-[#2D2D2D]">
            {members?.filter((user, index, self) => 
              index === self.findIndex(u => u.id === user.id)
            ).length || 0} member{(members?.filter((user, index, self) => 
              index === self.findIndex(u => u.id === user.id)
            ).length || 0) !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {members?.filter((user, index, self) => 
            index === self.findIndex(u => u.id === user.id)
          ).map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 px-3 py-2 bg-[#FAF9F6] rounded-lg"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-[#2D2D2D]">{user.name}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onRoomJoin}
            className="w-full px-4 py-3 bg-[#A8C3A0] text-white rounded-lg hover:bg-[#9BB396] transition-colors font-medium"
          >
            💬 Continue Chat
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                clearAllData();
                window.location.reload();
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              🗑️ Leave Room
            </button>
            
            <button
              onClick={() => {
                clearAllData();
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
            >
              🔄 Start Fresh
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-[#D9EAD3] rounded-lg">
          <p className="text-sm text-[#2D2D2D]">
            <strong>Invite Code:</strong> {currentRoom.inviteCode}
          </p>
          <p className="text-xs text-[#2D2D2D]/70 mt-1">
            Share this code with others to invite them to the room
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-[#A8C3A0] rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">
          Create or Join a Chat Room
        </h2>
        <p className="text-[#2D2D2D]/70">
          Start a new conversation or join an existing one
        </p>
      </div>

      <div className="space-y-6">
        {/* Create Room */}
        <div className="border border-gray-200 rounded-lg p-4 bg-[#FAF9F6]">
          <div className="flex items-center space-x-2 mb-3">
            <Plus className="w-5 h-5 text-[#A8C3A0]" />
            <h3 className="font-semibold text-[#2D2D2D]">Create New Room</h3>
          </div>
          <form onSubmit={handleCreateRoom}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8C3A0] focus:border-transparent outline-none bg-white/50"
                required
              />
              <button
                type="submit"
                disabled={!roomName.trim() || isCreating}
                className="px-4 py-2 bg-[#A8C3A0] text-white rounded-lg hover:bg-[#9BB396] focus:ring-2 focus:ring-[#A8C3A0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>

        {/* Join Room */}
        <div className="border border-gray-200 rounded-lg p-4 bg-[#FAF9F6]">
          <div className="flex items-center space-x-2 mb-3">
            <Hash className="w-5 h-5 text-[#A8C3A0]" />
            <h3 className="font-semibold text-[#2D2D2D]">Join Existing Room</h3>
          </div>
          <form onSubmit={handleJoinRoom}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#A8C3A0] focus:border-transparent outline-none bg-white/50"
                required
              />
              <button
                type="submit"
                disabled={!inviteCode.trim() || isJoining}
                className="px-4 py-2 bg-[#A8C3A0] text-white rounded-lg hover:bg-[#9BB396] focus:ring-2 focus:ring-[#A8C3A0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </form>
        </div>

        {/* Demo Instructions */}
        <div className="bg-[#D9EAD3] border border-[#A8C3A0] rounded-lg p-4">
          <h4 className="font-medium text-[#2D2D2D] mb-2">Demo Instructions</h4>
          <ul className="text-sm text-[#2D2D2D]/80 space-y-1">
            <li>• Open multiple browser windows to simulate different users</li>
            <li>• Create a room in one window, share the invite code</li>
            <li>• Join the same room from other windows</li>
            <li>• Experience real-time collaboration with AI</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

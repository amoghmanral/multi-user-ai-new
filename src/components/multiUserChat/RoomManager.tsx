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
      await navigator.clipboard.writeText(currentRoom.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (currentRoom) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Hash className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{currentRoom.name}</h2>
              <p className="text-sm text-gray-500">Room ID: {currentRoom.inviteCode}</p>
            </div>
          </div>
          <button
            onClick={copyInviteCode}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-600">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Invite</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">
            {members?.length || 0} member{(members?.length || 0) !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {members?.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-lg"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700">{user.name}</span>
            </div>
          ))}
        </div>

        {/* Start Fresh Button */}
        <button
          onClick={() => {
            clearAllData();
            window.location.reload();
          }}
          className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
        >
          🗑️ Start Fresh (Clear All Data)
        </button>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Share this code:</strong> {currentRoom.inviteCode}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Others can join this room using the invite code above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Join or Create a Room
        </h2>
        <p className="text-gray-600">
          Start collaborating with others in real-time
        </p>
      </div>

      <div className="space-y-6">
        {/* Create Room */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Plus className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Create New Room</h3>
          </div>
          <form onSubmit={handleCreateRoom}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="Enter room name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
              <button
                type="submit"
                disabled={!roomName.trim() || isCreating}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCreating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>

        {/* Join Room */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Hash className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Join Existing Room</h3>
          </div>
          <form onSubmit={handleJoinRoom}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
              <button
                type="submit"
                disabled={!inviteCode.trim() || isJoining}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </form>
        </div>

        {/* Demo Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Demo Instructions</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
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

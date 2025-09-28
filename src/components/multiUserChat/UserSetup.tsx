'use client';

import React, { useState } from 'react';
import { useMultiUserChat } from './MultiUserChatProvider';

interface UserSetupProps {
  onComplete: () => void;
}

const avatarColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
  '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
  '#10AC84', '#EE5A24', '#0984E3', '#A29BFE', '#FD79A8'
];

export const UserSetup: React.FC<UserSetupProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(avatarColors[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { setCurrentUser } = useMultiUserChat();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      console.log('Attempting to create user:', name.trim());
      const response = await fetch('http://128.61.119.144:4111/chat/users/get-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          avatarColor: selectedColor
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.success) {
        setCurrentUser(data.user);
        onComplete();
      } else {
        console.error('Failed to create user:', data.error);
        alert('Failed to create user: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error connecting to server. Please make sure the backend is running on port 8080. Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Multi-User AI Chat
          </h1>
          <p className="text-gray-600">
            Set up your profile to start collaborating
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Avatar Color
            </label>
            <div className="grid grid-cols-5 gap-3">
              {avatarColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${
                    selectedColor === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: selectedColor }}
            >
              {name.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{name || 'Your Name'}</p>
              <p className="text-sm text-gray-500">Preview</p>
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating Profile...' : 'Start Chatting'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This is a demo - no authentication required
          </p>
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen bg-gradient-to-b from-[#CDE3CE] to-[#FAF9F6] flex items-center justify-center p-4">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/85 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-20 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#A8C3A0] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-xl text-[#2D2D2D]">ChatSpace</span>
          </div>
          
          {/* Back Button */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.history.back()}
              className="text-[#2D2D2D] hover:text-[#A8C3A0] transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20 w-full max-w-2xl mx-auto px-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#2D2D2D] mb-4">
              Welcome to ChatSpace
            </h1>
            <p className="text-xl text-[#2D2D2D] leading-relaxed">
              Set up your profile to start collaborating with friends, teams, and AI
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-[#2D2D2D] mb-3">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-6 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#A8C3A0] focus:border-transparent outline-none transition-all bg-white/50 backdrop-blur-sm text-[#2D2D2D] text-lg"
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-[#2D2D2D] mb-4">
                Choose Your Avatar Color
              </label>
              <div className="grid grid-cols-5 gap-4">
                {avatarColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-16 h-16 rounded-full border-4 transition-all hover:scale-105 ${
                      selectedColor === color
                        ? 'border-[#2D2D2D] scale-110 shadow-lg'
                        : 'border-gray-300 hover:border-[#A8C3A0]'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Avatar Preview */}
            <div className="bg-[#FAF9F6] rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center space-x-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg"
                  style={{ backgroundColor: selectedColor }}
                >
                  {name.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-xl font-semibold text-[#2D2D2D]">{name || 'Your Name'}</p>
                  <p className="text-[#A8C3A0] font-medium">Profile Preview</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="w-full bg-[#A8C3A0] hover:bg-[#9BB396] text-white py-4 px-8 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Profile...' : 'Start Chatting'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-[#2D2D2D]/70">
              This is a demo - no authentication required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

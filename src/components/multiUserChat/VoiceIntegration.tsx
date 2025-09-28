'use client';

import React, { useEffect } from 'react';
import { useVoice } from 'cedar-os';
import { useMultiUserChat } from './MultiUserChatProvider';

interface VoiceIntegrationProps {}

export const VoiceIntegration: React.FC<VoiceIntegrationProps> = () => {
  const voice = useVoice();
  const { currentRoom, currentUser, socket, sendMessage } = useMultiUserChat();

  // Set up voice endpoint for Mastra backend
  useEffect(() => {
    if (voice.voiceEndpoint) {
      voice.setVoiceEndpoint('http://128.61.119.144:4111/chat/voice-execute');
    }
  }, [voice]);

  // Handle voice messages and broadcast to room
  useEffect(() => {
    if (!socket || !currentRoom || !currentUser) return;

    // Listen for voice completion
    const handleVoiceComplete = (audioData: any, transcription: string) => {
      if (transcription && currentRoom && currentUser) {
        // Send voice message to room
        socket.emit('voice-message', {
          roomId: currentRoom.id,
          userId: currentUser.id,
          audioData,
          metadata: {
            transcription,
            timestamp: new Date().toISOString()
          }
        });

        // Also send as text message for context
        sendMessage(`🎤 Voice: ${transcription}`, 'text');
      }
    };

    // Listen for voice errors
    const handleVoiceError = (error: string) => {
      console.error('Voice error:', error);
      sendMessage('Voice input failed. Please try again.', 'ai');
    };

    // Add event listeners (these would need to be implemented in Cedar OS voice system)
    // voice.on('voiceComplete', handleVoiceComplete);
    // voice.on('voiceError', handleVoiceError);

    return () => {
      // voice.off('voiceComplete', handleVoiceComplete);
      // voice.off('voiceError', handleVoiceError);
    };
  }, [socket, currentRoom, currentUser, sendMessage]);

  // Handle voice permission and setup
  const handleVoiceToggle = async () => {
    try {
      // Check browser support
      if (!voice.checkVoiceSupport()) {
        console.error('Voice not supported in this browser');
        return;
      }

      // Request permission if needed
      if (voice.voicePermissionStatus === 'prompt') {
        await voice.requestVoicePermission();
      }

      // Toggle voice if permitted
      if (voice.voicePermissionStatus === 'granted') {
        voice.toggleVoice();
      } else if (voice.voicePermissionStatus === 'denied') {
        console.error('Microphone permission denied');
        sendMessage('Microphone permission is required for voice input.', 'ai');
      }
    } catch (error) {
      console.error('Error toggling voice:', error);
      sendMessage('Failed to start voice input. Please try again.', 'ai');
    }
  };

  // Voice status indicator
  const getVoiceStatus = () => {
    if (voice.voiceError) {
      return {
        status: 'error',
        message: voice.voiceError,
        color: 'text-red-500'
      };
    }

    if (voice.isListening) {
      return {
        status: 'listening',
        message: 'Listening...',
        color: 'text-red-500'
      };
    }

    if (voice.isSpeaking) {
      return {
        status: 'speaking',
        message: 'AI is speaking...',
        color: 'text-green-500'
      };
    }

    switch (voice.voicePermissionStatus) {
      case 'granted':
        return {
          status: 'ready',
          message: 'Voice ready',
          color: 'text-blue-500'
        };
      case 'denied':
        return {
          status: 'denied',
          message: 'Microphone access denied',
          color: 'text-red-500'
        };
      case 'not-supported':
        return {
          status: 'not-supported',
          message: 'Voice not supported',
          color: 'text-orange-500'
        };
      default:
        return {
          status: 'prompt',
          message: 'Click to enable voice',
          color: 'text-gray-500'
        };
    }
  };

  const voiceStatus = getVoiceStatus();

  return (
    <div className="flex items-center space-x-2">
      {/* Voice Status Indicator */}
      <div className={`text-xs ${voiceStatus.color}`}>
        {voiceStatus.message}
      </div>

      {/* Voice Permission Status */}
      {voice.voicePermissionStatus === 'denied' && (
        <div className="text-xs text-red-500">
          Please enable microphone access in your browser settings
        </div>
      )}

      {/* Voice Settings */}
      {voice.voicePermissionStatus === 'granted' && (
        <div className="flex items-center space-x-2">
          <select
            value={voice.voiceSettings?.language || 'en-US'}
            onChange={(e) => voice.updateVoiceSettings?.({ language: e.target.value })}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="en-US">English (US)</option>
            <option value="en-GB">English (UK)</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
          </select>
        </div>
      )}
    </div>
  );
};

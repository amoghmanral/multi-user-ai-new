'use client';

import React from 'react';
import RadialMenuSpell from '@/cedar/components/spells/RadialMenuSpell';
import TooltipMenuSpell from '@/cedar/components/spells/TooltipMenuSpell';
import { useMultiUserChat } from '../MultiUserChatProvider';
import { 
  Upload, 
  Users, 
  Bot, 
  FileText, 
  MessageSquare, 
  RefreshCw,
  Mic,
  MicOff,
  Hash,
  Copy,
  Check
} from 'lucide-react';

export const MultiUserChatSpells: React.FC = () => {
  const {
    currentRoom,
    roomUsers,
    isVoiceEnabled,
    toggleVoice,
    uploadFile,
    sendMessage,
    createRoom,
    joinRoom
  } = useMultiUserChat();

  // Quick Actions Radial Menu (Ctrl+K)
  const quickActionsItems = [
    {
      title: 'Upload File',
      icon: Upload,
      onInvoke: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,application/pdf,text/*,.doc,.docx';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            try {
              await uploadFile(file);
            } catch (error) {
              console.error('Failed to upload file:', error);
            }
          }
        };
        input.click();
      }
    },
    {
      title: 'Invite User',
      icon: Hash,
      onInvoke: () => {
        if (currentRoom?.inviteCode) {
          navigator.clipboard.writeText(currentRoom.inviteCode);
          // Show a brief notification
          const notification = document.createElement('div');
          notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg z-50';
          notification.textContent = 'Invite code copied!';
          document.body.appendChild(notification);
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 2000);
        }
      }
    },
    {
      title: 'Mention AI',
      icon: Bot,
      onInvoke: () => {
        sendMessage('@ai Hello! Can you help with something?', 'text');
      }
    },
    {
      title: 'Summarize Chat',
      icon: FileText,
      onInvoke: () => {
        sendMessage('@ai Can you summarize our conversation so far?', 'text');
      }
    },
    {
      title: isVoiceEnabled ? 'Disable Voice' : 'Enable Voice',
      icon: isVoiceEnabled ? MicOff : Mic,
      onInvoke: () => {
        toggleVoice();
      }
    },
    {
      title: 'Refresh Room',
      icon: RefreshCw,
      onInvoke: () => {
        window.location.reload();
      }
    }
  ];

  // Text Selection Actions
  const selectionActions = [
    {
      title: 'Ask AI about this',
      icon: Bot,
      onInvoke: () => {
        // This will be handled by the floating input
      },
      spawnsInput: true
    },
    {
      title: 'Explain this',
      icon: MessageSquare,
      onInvoke: () => {
        // This will be handled by the floating input
      },
      spawnsInput: true
    },
    {
      title: 'Translate this',
      icon: '🌐',
      onInvoke: () => {
        // This will be handled by the floating input
      },
      spawnsInput: true
    },
    {
      title: 'Take notes on this',
      icon: FileText,
      onInvoke: () => {
        // This will be handled by the floating input
      },
      spawnsInput: true
    }
  ];

  return (
    <>
      {/* Quick Actions Radial Menu - Ctrl+K */}
      <RadialMenuSpell
        spellId="multi-user-quick-actions"
        items={quickActionsItems}
        activationConditions={{
          events: ['k'],
          modifiers: ['Control'],
          mode: 'toggle'
        }}
      />

      {/* Text Selection Tooltip Menu */}
      <TooltipMenuSpell
        spellId="multi-user-selection-actions"
        items={selectionActions}
        stream={true}
      />
    </>
  );
};

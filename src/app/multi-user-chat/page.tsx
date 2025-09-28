'use client';

import React from 'react';
import { MultiUserChatProvider, useMultiUserChat } from '@/components/multiUserChat/MultiUserChatProvider';
import { UserSetup } from '@/components/multiUserChat/UserSetup';
import { MultiUserChatInterface } from '@/components/multiUserChat/MultiUserChatInterface';

function MultiUserChatContent() {
  const { currentUser } = useMultiUserChat();
  const [showUserSetup, setShowUserSetup] = React.useState(false);

  // Check if we have a user on mount and decide whether to show setup
  React.useEffect(() => {
    if (currentUser) {
      console.log('Found existing user, skipping setup:', currentUser);
      setShowUserSetup(false);
    } else {
      console.log('No existing user, showing setup');
      setShowUserSetup(true);
    }
  }, [currentUser]);

  // Also check localStorage directly on mount as a fallback
  React.useEffect(() => {
    const savedUser = localStorage.getItem('multiUserChat_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        console.log('Found saved user in localStorage:', user);
        setShowUserSetup(false);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen">
      {showUserSetup ? (
        <UserSetup onComplete={() => setShowUserSetup(false)} />
      ) : (
        <MultiUserChatInterface />
      )}
    </div>
  );
}

export default function MultiUserChatPage() {
  return (
    <MultiUserChatProvider>
      <MultiUserChatContent />
    </MultiUserChatProvider>
  );
}

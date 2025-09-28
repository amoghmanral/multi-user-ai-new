'use client';

import React from 'react';
import { MultiUserChatProvider } from '@/components/multiUserChat/MultiUserChatProvider';
import { UserSetup } from '@/components/multiUserChat/UserSetup';
import { MultiUserChatInterface } from '@/components/multiUserChat/MultiUserChatInterface';

export default function MultiUserChatPage() {
  const [userSetupComplete, setUserSetupComplete] = React.useState(false);

  return (
    <MultiUserChatProvider>
      <div className="min-h-screen">
        {!userSetupComplete ? (
          <UserSetup onComplete={() => setUserSetupComplete(true)} />
        ) : (
          <MultiUserChatInterface />
        )}
      </div>
    </MultiUserChatProvider>
  );
}

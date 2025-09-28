'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MultiUserChatProvider } from '@/components/multiUserChat/MultiUserChatProvider';
import { UserSetup } from '@/components/multiUserChat/UserSetup';

function UserSetupContent() {
  const router = useRouter();

  const handleSetupComplete = () => {
    // Redirect to the multi-user chat page after setup is complete
    router.push('/multi-user-chat');
  };

  return (
    <div className="min-h-screen">
      <UserSetup onComplete={handleSetupComplete} />
    </div>
  );
}

export default function UserSetupPage() {
  return (
    <MultiUserChatProvider>
      <UserSetupContent />
    </MultiUserChatProvider>
  );
}

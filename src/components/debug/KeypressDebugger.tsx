'use client';

import React, { useEffect, useState } from 'react';
import { useCedarStore } from 'cedar-os';

interface KeypressEvent {
  key: string;
  code: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  timestamp: number;
  target: string;
}

export const KeypressDebugger: React.FC = () => {
  const [keypresses, setKeypresses] = useState<KeypressEvent[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  // Get spell states from Cedar store using selector
  const spellStates = useCedarStore((state) => state.spells || {});

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keypress: KeypressEvent = {
        key: event.key,
        code: event.code,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        timestamp: Date.now(),
        target: event.target ? (event.target as HTMLElement).tagName : 'unknown'
      };

      setKeypresses(prev => [keypress, ...prev.slice(0, 19)]); // Keep last 20 events

      // Check for Ctrl+K or Cmd+K
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        console.log('🔍 Ctrl/Cmd+K detected!', {
          key: event.key,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          target: event.target,
          preventDefault: event.defaultPrevented
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-mono z-50"
      >
        Debug Keys
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs font-mono z-50 max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Keypress Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-400 hover:text-red-300"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="text-yellow-400 font-bold">Recent Keypresses:</div>
        {keypresses.map((kp, i) => (
          <div key={i} className="text-xs">
            <span className="text-green-400">
              {kp.ctrlKey ? 'Ctrl+' : ''}
              {kp.metaKey ? 'Cmd+' : ''}
              {kp.altKey ? 'Alt+' : ''}
              {kp.shiftKey ? 'Shift+' : ''}
              {kp.key}
            </span>
            <span className="text-gray-400 ml-2">
              ({kp.target})
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="text-yellow-400 font-bold">Spell States:</div>
        {Object.entries(spellStates).map(([spellId, state]) => (
          <div key={spellId} className="text-xs">
            <span className="text-blue-400">{spellId}:</span>
            <span className="text-gray-400 ml-1">
              {JSON.stringify(state, null, 2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

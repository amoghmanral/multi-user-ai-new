'use client';

import React from 'react';
import { KeypressDebugger } from '@/components/debug/KeypressDebugger';
import RadialMenuSpell from '@/cedar/components/spells/RadialMenuSpell';
import TooltipMenuSpell from '@/cedar/components/spells/TooltipMenuSpell';
import { ActivationMode } from 'cedar-os';

export default function TestSpellsPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cedar Spells Test Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-2 text-gray-700">
            <p><strong>Test 1:</strong> Press <kbd className="bg-gray-200 px-2 py-1 rounded">T</kbd> to test the simple spell</p>
            <p><strong>Test 2:</strong> Press <kbd className="bg-gray-200 px-2 py-1 rounded">Ctrl+K</kbd> or <kbd className="bg-gray-200 px-2 py-1 rounded">Cmd+K</kbd> to test the radial menu</p>
            <p><strong>Test 3:</strong> Select some text to test the tooltip menu</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Content</h2>
          <p className="text-gray-700 mb-4">
            This is some test content. Try selecting this text to see if the tooltip menu appears.
            You can also test the keyboard shortcuts mentioned above.
          </p>
          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-sm text-gray-600">
              This is a text area where you can test text selection and the tooltip menu functionality.
              Select any part of this text and see if the context menu appears with AI actions.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <p className="text-gray-700 mb-4">
            Check the browser console for debug logs. The debug panel in the bottom right will show keypress events.
          </p>
          <div className="text-sm text-gray-600">
            <p>Expected console logs:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>🔮 MultiUserChatSpells: Rendering spells with items: X</li>
              <li>🔮 RadialMenuSpell: Component mounted</li>
              <li>🎯 RadialMenuSpell activated! (when shortcuts work)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test spells directly */}
      <RadialMenuSpell
        spellId="test-radial-menu"
        items={[
          {
            title: 'Test Action 1',
            icon: '🧪',
            onInvoke: () => {
              console.log('🧪 Test Action 1 activated!');
              alert('Test Action 1 works!');
            }
          },
          {
            title: 'Test Action 2',
            icon: '⚡',
            onInvoke: () => {
              console.log('⚡ Test Action 2 activated!');
              alert('Test Action 2 works!');
            }
          }
        ]}
        activationConditions={{
          events: ['ctrl+k', 'cmd+k'],
          mode: ActivationMode.TOGGLE
        }}
      />

      <RadialMenuSpell
        spellId="test-simple-spell"
        items={[{
          title: 'Simple Test',
          icon: 'T',
          onInvoke: () => {
            console.log('🧪 Simple test spell activated!');
            alert('Simple test spell works!');
          }
        }]}
        activationConditions={{
          events: ['t'],
          mode: ActivationMode.TOGGLE
        }}
      />

      <TooltipMenuSpell
        spellId="test-tooltip-menu"
        items={[
          {
            title: 'Ask AI about this',
            icon: '🤖',
            onInvoke: () => {
              console.log('🤖 Ask AI action activated!');
              alert('Ask AI action works!');
            }
          },
          {
            title: 'Explain this',
            icon: '💡',
            onInvoke: () => {
              console.log('💡 Explain action activated!');
              alert('Explain action works!');
            }
          }
        ]}
        stream={true}
      />
      
      {/* Include the debug component */}
      <KeypressDebugger />
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Mic, 
  FileText, 
  Keyboard, 
  Mouse,
  ChevronDown,
  ChevronRight,
  Play,
  Copy,
  Check
} from 'lucide-react';

interface DemoInstructionsProps {
  onClose: () => void;
}

export const DemoInstructions: React.FC<DemoInstructionsProps> = ({ onClose }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['setup']);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const copyToClipboard = async (text: string, stepId: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const demoSteps = [
    {
      id: 'setup',
      title: 'Setup & Initial Demo',
      icon: Play,
      steps: [
        'Open 3 browser windows/tabs to simulate different users',
        'Navigate to http://localhost:3000/multi-user-chat in all windows',
        'Create user profiles with different names (e.g., Alice, Bob, Charlie)',
        'In Window 1: Create a room called "Product Planning"',
        'Copy the invite code and share it with other windows',
        'Join the same room from Windows 2 & 3 using the invite code'
      ]
    },
    {
      id: 'messaging',
      title: 'Real-time Messaging Demo',
      icon: MessageSquare,
      steps: [
        'Start a conversation between all users',
        'Type messages in different windows and see real-time updates',
        'Show typing indicators and user presence',
        'Demonstrate message history and persistence'
      ]
    },
    {
      id: 'ai',
      title: 'AI Integration Demo',
      icon: MessageSquare,
      steps: [
        'Type "@ai Hello! Can you help us plan our product?"',
        'Show AI responding with context about the room',
        'Upload a file (PDF, image, or text) and ask AI about it',
        'Demonstrate AI referencing uploaded files and conversation history',
        'Try: "@ai Can you summarize what we\'ve discussed?"'
      ]
    },
    {
      id: 'spells',
      title: 'Cedar OS Spells Demo',
      icon: Keyboard,
      steps: [
        'Press Ctrl+K to open the Quick Actions radial menu',
        'Try: Upload File, Invite User, Mention AI, Toggle Voice',
        'Select text in the chat and see the tooltip menu appear',
        'Try: Ask AI about this, Explain this, Translate this',
        'Show gesture-based interactions working seamlessly'
      ]
    },
    {
      id: 'voice',
      title: 'Voice Integration Demo',
      icon: Mic,
      steps: [
        'Click the voice toggle button to enable microphone',
        'Grant microphone permissions when prompted',
        'Record a voice message and see it transcribed',
        'Show AI responding with voice when voice input was used',
        'Demonstrate voice messages broadcasting to all users'
      ]
    },
    {
      id: 'files',
      title: 'File Sharing Demo',
      icon: FileText,
      steps: [
        'Upload different file types (PDF, images, documents)',
        'Show files appearing in chat with previews',
        'Ask AI about uploaded files: "@ai What does this document say?"',
        'Demonstrate AI accessing file content for context',
        'Show file organization and sharing across users'
      ]
    }
  ];

  const samplePrompts = [
    { text: "@ai Hello! Can you help us plan our product roadmap?", type: "AI Mention" },
    { text: "@ai Can you summarize our discussion so far?", type: "Summarization" },
    { text: "@ai What do you think about the uploaded document?", type: "File Analysis" },
    { text: "Let's discuss our Q1 priorities", type: "Team Discussion" },
    { text: "I think we should focus on mobile first", type: "Collaboration" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Multi-User AI Chat Demo Guide</h1>
              <p className="text-blue-100 mt-1">Complete walkthrough for hackathon presentation</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Quick Start */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Quick Start</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium mb-2">Ready to demo? Follow these steps:</p>
              <ol className="text-green-700 space-y-1">
                <li>1. Open 3 browser windows (simulate different users)</li>
                <li>2. Create room in Window 1, join from Windows 2 & 3</li>
                <li>3. Upload files, use @ai mentions, try Ctrl+K spells</li>
                <li>4. Show voice integration and real-time collaboration</li>
              </ol>
            </div>
          </div>

          {/* Demo Steps */}
          <div className="space-y-4">
            {demoSteps.map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <section.icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-900">{section.title}</span>
                  </div>
                  {expandedSections.includes(section.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedSections.includes(section.id) && (
                  <div className="px-4 pb-4">
                    <ol className="space-y-2">
                      {section.steps.map((step, index) => (
                        <li key={index} className="flex items-start space-x-3 text-gray-700">
                          <span className="bg-blue-100 text-blue-800 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-sm">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sample Prompts */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💬 Sample Prompts to Try</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {samplePrompts.map((prompt, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 font-medium">{prompt.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{prompt.type}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(prompt.text, `prompt-${index}`)}
                      className="ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {copiedStep === `prompt-${index}` ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Notes */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">📝 Technical Notes for Demo</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Backend runs on port 8080 (Socket.io server)</li>
              <li>• Frontend runs on port 3000 (Next.js)</li>
              <li>• SQLite database stores all data locally</li>
              <li>• File uploads stored in backend/uploads/ directory</li>
              <li>• AI context includes room history, files, and user info</li>
              <li>• Cedar OS spells provide gesture-based interactions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

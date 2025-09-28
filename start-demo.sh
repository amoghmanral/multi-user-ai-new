#!/bin/bash

# Multi-User AI Chat Demo Startup Script
# This script starts both the frontend and backend servers for the demo

echo "🚀 Starting Multi-User AI Chat Demo..."
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating template..."
    echo "OPENAI_API_KEY=your_openai_api_key_here" > .env
    echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8080" >> .env
    echo "NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000" >> .env
    echo ""
    echo "📝 Please edit .env file and add your OpenAI API key"
    echo "   Then run this script again."
    exit 1
fi

# Check if OpenAI API key is set
if ! grep -q "OPENAI_API_KEY=sk-" .env; then
    echo "⚠️  OpenAI API key not found in .env file"
    echo "   Please add your OpenAI API key to the .env file"
    echo "   Format: OPENAI_API_KEY=sk-your-key-here"
    exit 1
fi

echo "✅ Environment configuration found"
echo ""

# Create uploads directory if it doesn't exist
mkdir -p src/backend/uploads
echo "📁 Created uploads directory"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "src/backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd src/backend
    npm install
    cd ../..
fi

echo ""
echo "🎯 Starting servers..."
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"
echo "Multi-User Chat: http://localhost:3000/multi-user-chat"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers concurrently
npm run dev

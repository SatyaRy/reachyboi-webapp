#!/bin/bash

# Forex Education Web App - Quick Setup Script
# This script helps you get started quickly

set -e

echo "🎓 Forex Education Web App - Quick Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"
echo ""

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚙️  Setting up environment variables..."
    cp .env.example .env.local
    echo "✅ Created .env.local from template"
    echo ""
    echo "⚠️  IMPORTANT: You need to update .env.local with your Supabase credentials!"
    echo ""
    echo "   1. Go to https://supabase.com"
    echo "   2. Create a new project"
    echo "   3. Get your project URL and anon key"
    echo "   4. Update .env.local with these values"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

# Ask if user wants to start dev server
echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Set up your Supabase project (see SETUP.md)"
echo "  2. Run the database migrations (supabase/schema.sql)"
echo "  3. Update .env.local with your Supabase credentials"
echo "  4. Run: npm run dev"
echo ""

read -p "Do you want to start the development server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting development server..."
    echo ""
    echo "Open http://localhost:3000 in your browser"
    echo ""
    npm run dev
fi

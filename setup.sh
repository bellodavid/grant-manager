#!/bin/bash

echo "🚀 Setting up Grant Flow with Supabase..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update the .env file with your Supabase credentials before continuing."
    echo "   You need to set:"
    echo "   - DATABASE_URL (from Supabase Settings > Database)"
    echo "   - SUPABASE_URL"
    echo "   - SUPABASE_SERVICE_ROLE_KEY"
    echo "   - VITE_SUPABASE_URL"
    echo "   - VITE_SUPABASE_ANON_KEY"
    echo "   - SESSION_SECRET (generate a random 32+ character string)"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Running database migrations..."
npm run db:push

echo "✅ Setup complete! You can now run:"
echo "   npm run dev    # Start development server"
echo ""
echo "💡 Don't forget to:"
echo "   1. Update your .env file with real Supabase credentials"
echo "   2. Set up Row Level Security (RLS) policies in Supabase if needed"
echo "   3. Create initial user roles in the database"

#!/bin/bash

# Custom Authentication Setup Script
# This script helps you set up the custom authentication system

echo "=================================================="
echo "  Forex Education - Custom Auth Setup"
echo "=================================================="
echo ""

# Check if schema file exists
if [ ! -f "supabase/schema-custom-auth.sql" ]; then
    echo "❌ Error: schema-custom-auth.sql not found!"
    echo "   Please make sure you're in the frontend directory."
    exit 1
fi

echo "✅ Found schema file"
echo ""

echo "📋 This script will guide you through setting up custom authentication."
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Open your Supabase project dashboard"
echo "   URL: https://supabase.com/dashboard"
echo ""
echo "2. Navigate to 'SQL Editor' in the left sidebar"
echo ""
echo "3. Click 'New Query'"
echo ""
echo "4. Copy the contents of: supabase/schema-custom-auth.sql"
echo "   (File path: $(pwd)/supabase/schema-custom-auth.sql)"
echo ""
echo "5. Paste into the SQL Editor and click 'Run'"
echo ""
echo "This will create:"
echo "  - admins table (with default admin: admin@example.com / admin123)"
echo "  - authorized_users table (with 3 sample users)"
echo "  - Row Level Security policies"
echo "  - Necessary indexes and triggers"
echo ""

# Ask if user wants to see the schema
read -p "Would you like to view the schema file? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "=================================================="
    cat supabase/schema-custom-auth.sql
    echo "=================================================="
    echo ""
fi

echo ""
echo "After applying the schema, you can:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Visit: http://localhost:3000/auth/signin"
echo ""
echo "3. Test admin login:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""
echo "4. Test user login:"
echo "   Email: user1@example.com"
echo "   Exness Account ID: EXN123456"
echo ""
echo "For detailed instructions, see: CUSTOM_AUTH_SETUP.md"
echo ""
echo "=================================================="
echo "  Setup Complete!"
echo "=================================================="

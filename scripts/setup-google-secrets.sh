#!/bin/bash
#
# Setup Google OAuth Secrets for Open Brain
# 
# Usage:
#   ./setup-google-secrets.sh
#   or with arguments:
#   ./setup-google-secrets.sh "CLIENT_ID" "CLIENT_SECRET" "REFRESH_TOKEN"
#
# Note: This script requires the Supabase CLI to be installed and logged in
#       Run 'supabase login' first if you haven't already

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "Open Brain - Google Secrets Setup"
echo "========================================"
echo ""

# Supabase project reference
SUPABASE_PROJECT="jeuxslbhjubxmhtzpvqf"
REDIRECT_URI="https://${SUPABASE_PROJECT}.supabase.co/functions/v1/google-auth/callback"

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI is not installed or not in PATH"
    echo "   Install from: https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Error: Not logged in to Supabase CLI"
    echo "   Run: supabase login"
    exit 1
fi

echo "✅ Supabase CLI is ready"
echo ""

# Get values from arguments or prompt
if [ $# -ge 2 ]; then
    CLIENT_ID="$1"
    CLIENT_SECRET="$2"
    REFRESH_TOKEN="${3:-}"
else
    echo "Enter your Google OAuth credentials:"
    echo "(Find these in your Google Cloud Console > APIs & Services > Credentials)"
    echo ""
    
    read -p "Client ID: " CLIENT_ID
    read -sp "Client Secret: " CLIENT_SECRET
    echo ""
    
    echo ""
    echo "To get a refresh token, complete the OAuth flow first:"
    echo "1. Deploy the google-auth function: supabase functions deploy google-auth"
    echo "2. Visit: https://${SUPABASE_PROJECT}.supabase.co/functions/v1/google-auth/initiate"
    echo "3. Complete the authorization"
    echo "4. Copy the refresh token from the response"
    echo ""
    read -p "Refresh Token (leave empty to skip): " REFRESH_TOKEN
fi

# Validate inputs
if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Error: Client ID and Client Secret are required"
    exit 1
fi

echo ""
echo "Setting up secrets for project: ${SUPABASE_PROJECT}"
echo ""

# Set the secrets
echo "Setting GOOGLE_CLIENT_ID..."
echo "$CLIENT_ID" | supabase secrets set GOOGLE_CLIENT_ID

echo "Setting GOOGLE_CLIENT_SECRET..."
echo "$CLIENT_SECRET" | supabase secrets set GOOGLE_CLIENT_SECRET

echo "Setting GOOGLE_REDIRECT_URI..."
echo "$REDIRECT_URI" | supabase secrets set GOOGLE_REDIRECT_URI

if [ -n "$REFRESH_TOKEN" ]; then
    echo "Setting GOOGLE_REFRESH_TOKEN..."
    echo "$REFRESH_TOKEN" | supabase secrets set GOOGLE_REFRESH_TOKEN
fi

echo ""
echo "========================================"
echo "✅ Secrets configured successfully!"
echo "========================================"
echo ""
echo "Configured secrets:"
echo "  - GOOGLE_CLIENT_ID"
echo "  - GOOGLE_CLIENT_SECRET"
echo "  - GOOGLE_REDIRECT_URI"
if [ -n "$REFRESH_TOKEN" ]; then
    echo "  - GOOGLE_REFRESH_TOKEN"
fi
echo ""
echo "You can verify with: supabase secrets list"
echo ""

# Next steps
echo "Next steps:"
echo "1. Deploy the google-auth function:"
echo "   supabase functions deploy google-auth"
echo ""

if [ -z "$REFRESH_TOKEN" ]; then
    echo "2. Get a refresh token by visiting:"
    echo "   https://${SUPABASE_PROJECT}.supabase.co/functions/v1/google-auth/initiate"
    echo ""
    echo "3. After authorization, set the refresh token:"
    echo "   supabase secrets set GOOGLE_REFRESH_TOKEN=\"your_token_here\""
else
    echo "2. Deploy all Google integration functions:"
    echo "   supabase functions deploy email-ingest"
    echo "   supabase functions deploy calendar-sync"
    echo "   supabase functions deploy drive-sync"
    echo "   supabase functions deploy tasks-sync"
fi

echo ""

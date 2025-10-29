#!/bin/bash

load_env() {
    if [ -f .env.local ]; then
        set -a
        source .env.local
        set +a
    fi
}

load_env

echo "Generating Supabase types from remote project..."

# Extract project ID from NEXT_PUBLIC_SUPABASE_URL if not set directly
if [ -z "$SUPABASE_PROJECT_ID" ]; then
    # Extract from URL like https://zrcawujydeevzdhlwpin.supabase.co
    SUPABASE_PROJECT_ID=$(echo "$NEXT_PUBLIC_SUPABASE_URL" | sed -n 's/.*https:\/\/\([^.]*\)\.supabase\.co.*/\1/p')
fi

if [ -z "$SUPABASE_PROJECT_ID" ]; then
    echo "Error: Could not determine SUPABASE_PROJECT_ID"
    echo "Please set SUPABASE_PROJECT_ID in .env.local or ensure NEXT_PUBLIC_SUPABASE_URL is correct"
    exit 1
fi

echo "Using project ID: $SUPABASE_PROJECT_ID"

supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" > src/types/supabase/generated.ts

if [ $? -eq 0 ]; then
    echo "Types generated successfully at src/types/supabase/generated.ts"
else
    echo "Failed to generate types"
    exit 1
fi

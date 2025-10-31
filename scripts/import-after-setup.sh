#!/bin/bash

# Import workflows after n8n setup is complete
N8N_URL="http://localhost:15678"
N8N_DIR="$(dirname "$0")/../n8n"

echo "🚀 Importing workflows after setup..."

# Simple workflow import function
import_workflow() {
    local file="$1"
    local name=$(basename "$file" .json)
    
    echo "📄 Importing: $name"
    
    # Read and import the workflow
    local response=$(curl -s -X POST "$N8N_URL/rest/workflows" \
        -H "Content-Type: application/json" \
        --data-binary @"$file")
    
    if echo "$response" | grep -q '"id":'; then
        local id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Imported successfully (ID: $id)"
        return 0
    else
        echo "❌ Failed: $response"
        return 1
    fi
}

# Import all workflows
echo "🔍 Finding workflows..."
success=0
total=0

find "$N8N_DIR" -name "*.json" -type f | while read -r file; do
    total=$((total + 1))
    if import_workflow "$file"; then
        success=$((success + 1))
    fi
    sleep 0.1
done

echo ""
echo "📊 Import completed!"
echo "🌐 Check your workflows at: $N8N_URL"

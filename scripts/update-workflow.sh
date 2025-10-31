#!/bin/bash

# Update n8n workflow via API
# Usage: 
#   ./update-workflow.sh <workflow-file.json> [workflow-id]  - Update specific file
#   ./update-workflow.sh                                     - Update all workflows in n8n/

WORKFLOW_FILE="$1"
WORKFLOW_ID="$2"
N8N_URL="http://localhost:15678"
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"

# Function to update a single workflow
update_single_workflow() {
    local file="$1"
    local id="$2"
    
    echo "📄 Processing: $(basename "$file")"
    
    # Validate JSON first
    if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "❌ Invalid JSON in: $file"
        return 1
    fi
    
    if [ -n "$id" ]; then
        # Update existing workflow
        echo "🔄 Updating existing workflow ID: $id"
        RESPONSE=$(curl -s -X PUT "$N8N_URL/rest/workflows/$id" \
            -H "Content-Type: application/json" \
            -d @"$file")
    else
        # Create new workflow or update by name
        echo "➕ Creating/updating workflow"
        RESPONSE=$(curl -s -X POST "$N8N_URL/rest/workflows" \
            -H "Content-Type: application/json" \
            -d @"$file")
    fi
    
    # Check if response contains error
    if echo "$RESPONSE" | grep -q '"message":\|"error":'; then
        echo "❌ API Error: $RESPONSE"
        return 1
    fi
    
    # Extract workflow ID from response
    NEW_ID=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'unknown'))" 2>/dev/null)
    echo "✅ Success! Workflow ID: $NEW_ID"
    return 0
}

# If no arguments provided, update all workflows
if [ -z "$WORKFLOW_FILE" ]; then
    echo "🔍 Scanning for all workflow files in: $N8N_DIR"
    
    if [ ! -d "$N8N_DIR" ]; then
        echo "❌ n8n directory not found: $N8N_DIR"
        exit 1
    fi
    
    # Find all .json files in n8n directory and subdirectories
    WORKFLOW_COUNT=0
    SUCCESS_COUNT=0
    
    while IFS= read -r -d '' file; do
        WORKFLOW_COUNT=$((WORKFLOW_COUNT + 1))
        echo ""
        echo "📁 Found workflow: ${file#$PROJECT_ROOT/}"
        
        if update_single_workflow "$file"; then
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        fi
        
    done < <(find "$N8N_DIR" -name "*.json" -type f -print0)
    
    echo ""
    echo "📊 Summary:"
    echo "   Total workflows found: $WORKFLOW_COUNT"
    echo "   Successfully updated: $SUCCESS_COUNT"
    echo "   Failed: $((WORKFLOW_COUNT - SUCCESS_COUNT))"
    
    if [ $SUCCESS_COUNT -eq $WORKFLOW_COUNT ]; then
        echo "🎉 All workflows updated successfully!"
    else
        echo "⚠️  Some workflows failed to update"
        exit 1
    fi
    
    exit 0
fi

# Single file mode
if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Error: Workflow file not found: $WORKFLOW_FILE"
    echo ""
    echo "Usage:"
    echo "  $0 <workflow-file.json> [workflow-id]  - Update specific file"
    echo "  $0                                     - Update all workflows in n8n/"
    exit 1
fi

echo "📄 Processing single file: $WORKFLOW_FILE"
update_single_workflow "$WORKFLOW_FILE" "$WORKFLOW_ID"
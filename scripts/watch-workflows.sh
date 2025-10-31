#!/bin/bash

# Auto-update n8n workflows when files change
# Usage: ./watch-workflows.sh

WORKFLOW_DIR="/home/ai-dragon/git/ai/sbs/n8n"
N8N_URL="http://localhost:15678"
SCRIPT_DIR="/home/ai-dragon/git/ai/sbs/scripts"

echo "Watching for workflow changes in: $WORKFLOW_DIR"
echo "n8n URL: $N8N_URL"

# Function to update workflow
update_workflow() {
    local file="$1"
    echo "Detected change in: $file"
    
    # Validate JSON
    if python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "✅ JSON valid, updating workflow..."
        "$SCRIPT_DIR/update-workflow.sh" "$file"
    else
        echo "❌ Invalid JSON, skipping update"
    fi
}

# Check if inotify-tools is available
if ! command -v inotifywait &> /dev/null; then
    echo "Installing inotify-tools for file watching..."
    sudo apt-get update && sudo apt-get install -y inotify-tools
fi

# Watch for changes in JSON files
inotifywait -m -r -e close_write --format '%w%f' "$WORKFLOW_DIR" |
while read file; do
    if [[ "$file" == *.json ]]; then
        # Add small delay to ensure file write is complete
        sleep 1
        update_workflow "$file"
    fi
done
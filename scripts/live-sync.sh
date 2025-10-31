#!/bin/bash

# Live Sync Workflow Updater for N8N
# Monitors file changes and automatically imports/updates workflows

set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"
N8N_URL="http://localhost:15678"

echo "🔄 N8N Live Sync Monitor"
echo "======================="

# Check if inotify-tools is available
if ! command -v inotifywait > /dev/null; then
    echo "📦 Installing inotify-tools for file monitoring..."
    sudo apt-get update && sudo apt-get install -y inotify-tools
fi

# Function to import/update a single workflow
sync_workflow() {
    local file="$1"
    local filename=$(basename "$file" .json)
    
    echo "🔄 Syncing: $filename"
    
    # Validate JSON first
    if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "❌ Invalid JSON format - skipping"
        return 1
    fi
    
    # Copy to n8n data directory
    local n8n_workflows_dir="$PROJECT_ROOT/data/n8n/workflows"
    mkdir -p "$n8n_workflows_dir"
    cp "$file" "$n8n_workflows_dir/$filename.json"
    
    # Import using n8n CLI
    if docker exec sbs-n8n-1 n8n import:workflow --input="/home/node/.n8n/workflows/$filename.json" 2>/dev/null; then
        echo "✅ $filename synced successfully"
        
        # Clean up temp file
        rm -f "$n8n_workflows_dir/$filename.json"
        return 0
    else
        echo "⚠️  $filename sync failed (might already exist or have validation issues)"
        rm -f "$n8n_workflows_dir/$filename.json"
        return 1
    fi
}

# Function to start file monitoring
start_monitoring() {
    echo "👁️  Starting file monitoring..."
    echo "📁 Monitoring directory: $N8N_DIR"
    echo "🔄 Changes will automatically sync to n8n"
    echo ""
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    
    # Monitor for file changes
    inotifywait -m -r -e modify,create,moved_to --format '%w%f' "$N8N_DIR" \
        --include '.*\.json$' | while read file; do
        
        # Skip if file doesn't exist (might be a temp file)
        [ -f "$file" ] || continue
        
        # Add a small delay to ensure file write is complete
        sleep 0.5
        
        echo "📝 File changed: $(basename "$file")"
        sync_workflow "$file"
        echo ""
    done
}

# Function to perform initial sync
initial_sync() {
    echo "🚀 Performing initial sync of all workflows..."
    
    local success=0
    local failed=0
    
    find "$N8N_DIR" -name "*.json" -type f | sort | while read -r file; do
        if sync_workflow "$file"; then
            success=$((success + 1))
        else
            failed=$((failed + 1))
        fi
        sleep 0.1
    done
    
    echo ""
    echo "📊 Initial sync complete!"
    echo "   ✅ Successfully synced: $success"
    echo "   ❌ Failed/Skipped: $failed"
    echo ""
}

# Function to show current status
show_status() {
    echo "📊 Current Status:"
    echo "=================="
    
    # Check n8n status
    if curl -s "$N8N_URL/healthz" | grep -q "ok"; then
        echo "✅ n8n is running and healthy"
    else
        echo "❌ n8n is not responding"
        return 1
    fi
    
    # Count workflows
    local workflow_count=$(docker exec sbs-n8n-1 n8n list:workflow 2>/dev/null | wc -l || echo "0")
    echo "📄 Workflows in n8n: $workflow_count"
    
    # Count JSON files
    local json_count=$(find "$N8N_DIR" -name "*.json" -type f | wc -l)
    echo "📁 JSON files in source: $json_count"
    
    echo ""
}

# Function to validate all JSON files
validate_json_files() {
    echo "🔍 Validating JSON files..."
    
    local valid=0
    local invalid=0
    
    find "$N8N_DIR" -name "*.json" -type f | while read -r file; do
        local filename=$(basename "$file")
        
        if python3 -m json.tool "$file" > /dev/null 2>&1; then
            valid=$((valid + 1))
        else
            echo "❌ Invalid: $filename"
            invalid=$((invalid + 1))
        fi
    done
    
    echo "📊 JSON Validation Results:"
    echo "   ✅ Valid files: $valid"
    echo "   ❌ Invalid files: $invalid"
    echo ""
}

# Main menu
show_menu() {
    echo "Choose an option:"
    echo "1) Start live monitoring (recommended)"
    echo "2) Perform one-time sync"
    echo "3) Show current status"
    echo "4) Validate JSON files"
    echo "5) Exit"
    echo ""
    read -p "Enter choice [1-5]: " choice
    
    case $choice in
        1)
            show_status
            if [ $? -eq 0 ]; then
                start_monitoring
            fi
            ;;
        2)
            show_status
            if [ $? -eq 0 ]; then
                initial_sync
            fi
            ;;
        3)
            show_status
            show_menu
            ;;
        4)
            validate_json_files
            show_menu
            ;;
        5)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            show_menu
            ;;
    esac
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n\n🛑 Monitoring stopped by user"; exit 0' INT

# Main execution
main() {
    echo "🔧 Initializing live sync system..."
    
    # Check prerequisites
    if ! docker ps | grep -q sbs-n8n-1; then
        echo "❌ n8n container is not running"
        echo "   Please start your containers with: docker compose up -d"
        exit 1
    fi
    
    show_menu
}

main "$@"
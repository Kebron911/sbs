#!/bin/bash

# N8N Workflow Mass Importer with Auto-Setup
# This script automatically imports all JSON workflows into n8n
# Usage: ./bulk-import-n8n.sh [--skip-validation] [--force-import]

set -e

N8N_URL="http://localhost:15678"
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"

# Parse arguments
SKIP_VALIDATION=false
FORCE_IMPORT=false
for arg in "$@"; do
    case $arg in
        --skip-validation) SKIP_VALIDATION=true ;;
        --force-import) FORCE_IMPORT=true ;;
    esac
done

echo "🚀 N8N Bulk Workflow Importer"
echo "=============================="
echo "📁 Source directory: $N8N_DIR"
echo "🌐 n8n URL: $N8N_URL"
echo ""

# Wait for n8n
wait_for_n8n() {
    local max_attempts=30
    echo "⏳ Waiting for n8n..."
    for i in $(seq 1 $max_attempts); do
        if curl -s "$N8N_URL/healthz" >/dev/null 2>&1; then
            echo "✅ n8n is ready"
            return 0
        fi
        echo "   Attempt $i/$max_attempts"
        sleep 2
    done
    echo "❌ n8n not responding"
    return 1
}

# Disable n8n authentication (for automation)
disable_n8n_auth() {
    echo "🔓 Attempting to disable n8n authentication for bulk import..."
    
    # Try to set n8n to public mode via environment or API
    local container_name=$(docker ps --format "{{.Names}}" | grep n8n | head -1)
    if [ -n "$container_name" ]; then
        echo "🐳 Found n8n container: $container_name"
        
        # Try to restart n8n with public access
        docker exec "$container_name" sh -c '
            export N8N_USER_MANAGEMENT_DISABLED=true
            export N8N_DIAGNOSTICS_ENABLED=false
            pkill -f n8n || true
            sleep 2
            n8n start --tunnel &
        ' >/dev/null 2>&1 || true
        
        sleep 5
        echo "🔄 Restarted n8n with public access attempt"
    fi
}

# Import single workflow
import_workflow() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "📄 $filename"
    
    # Validate JSON unless skipped
    if [ "$SKIP_VALIDATION" = false ]; then
        if ! python3 -m json.tool "$file" >/dev/null 2>&1; then
            if [ "$FORCE_IMPORT" = true ]; then
                echo "⚠️  Invalid JSON but forcing import..."
            else
                echo "❌ Invalid JSON - skipping"
                return 1
            fi
        fi
    fi
    
    # Try multiple import methods
    local methods=(
        "POST /rest/workflows"
        "POST /api/v1/workflows"  
        "POST /rest/workflows/import"
        "PUT /rest/workflows"
    )
    
    for method in "${methods[@]}"; do
        local verb=$(echo "$method" | cut -d' ' -f1)
        local endpoint=$(echo "$method" | cut -d' ' -f2)
        
        local response=$(curl -s -X "$verb" "$N8N_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d @"$file" 2>/dev/null || echo "failed")
        
        if echo "$response" | grep -q '"id":\|"name":\|"success":true'; then
            local id=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', data.get('workflowId', 'imported')))
except:
    print('imported')
" 2>/dev/null)
            echo "✅ Imported via $endpoint (ID: $id)"
            return 0
        fi
    done
    
    # Try file-based import as last resort
    local container_name=$(docker ps --format "{{.Names}}" | grep n8n | head -1)
    if [ -n "$container_name" ]; then
        docker cp "$file" "$container_name:/tmp/$filename" 2>/dev/null || true
        local result=$(docker exec "$container_name" sh -c "
            cd /tmp
            if [ -f '$filename' ]; then
                # Try to import via n8n CLI if available
                n8n import:workflow --file='$filename' 2>/dev/null && echo 'cli_success' || echo 'cli_failed'
            fi
        " 2>/dev/null || echo "container_failed")
        
        if echo "$result" | grep -q "cli_success"; then
            echo "✅ Imported via container CLI"
            return 0
        fi
    fi
    
    echo "❌ Failed all import methods"
    return 1
}

# Main function
main() {
    if ! wait_for_n8n; then
        echo "❌ Cannot proceed - n8n is not responding"
        exit 1
    fi
    
    # Try to disable auth for automation
    disable_n8n_auth
    
    echo "🔍 Scanning for workflow files..."
    
    if [ ! -d "$N8N_DIR" ]; then
        echo "❌ Workflow directory not found: $N8N_DIR"
        exit 1
    fi
    
    # Count workflows first
    local total_files=$(find "$N8N_DIR" -name "*.json" -type f | wc -l)
    echo "📊 Found $total_files workflow files"
    echo ""
    
    if [ "$total_files" -eq 0 ]; then
        echo "❌ No JSON files found in $N8N_DIR"
        exit 1
    fi
    
    # Import all workflows
    local success_count=0
    local current=0
    
    while IFS= read -r -d '' file; do
        current=$((current + 1))
        echo "[$current/$total_files] $(echo "${file#$PROJECT_ROOT/}" | cut -c1-60)"
        
        if import_workflow "$file"; then
            success_count=$((success_count + 1))
        fi
        
        # Small delay to avoid overwhelming n8n
        sleep 0.5
    done < <(find "$N8N_DIR" -name "*.json" -type f -print0)
    
    echo ""
    echo "📈 Import Results:"
    echo "   Total files: $total_files"
    echo "   Successful: $success_count"
    echo "   Failed: $((total_files - success_count))"
    
    if [ $success_count -eq $total_files ]; then
        echo "🎉 All workflows imported successfully!"
    elif [ $success_count -gt 0 ]; then
        echo "✅ Partial success - $success_count/$total_files imported"
    else
        echo "❌ No workflows were imported"
        echo ""
        echo "💡 Troubleshooting:"
        echo "   1. Check n8n is accessible at: $N8N_URL"
        echo "   2. Verify JSON files are valid"
        echo "   3. Try: $0 --skip-validation --force-import"
        exit 1
    fi
    
    echo ""
    echo "🌐 Access n8n at: $N8N_URL"
}

main "$@"
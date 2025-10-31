#!/bin/bash

# Automated N8N Workflow Importer using CLI
# This script provides full automation using n8n's built-in CLI import

set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"
N8N_URL="http://localhost:15678"

echo "🚀 N8N CLI Workflow Importer"
echo "============================"

# Function to wait for n8n to be ready
wait_for_n8n() {
    echo "⏳ Waiting for n8n to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$N8N_URL/healthz" | grep -q "ok"; then
            echo "✅ n8n is ready"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ n8n not ready after $max_attempts attempts"
    return 1
}

# Function to import workflows using n8n CLI
import_workflows_cli() {
    echo "🔍 Importing all workflows using n8n CLI..."
    
    # Use n8n's built-in import with --separate flag to import entire directory
    local result
    docker exec sbs-n8n-1 n8n import:workflow --separate --input=/home/node/.n8n/workflows/
    result=$?
    
    if [ $result -eq 0 ]; then
        echo "✅ CLI import completed successfully!"
        return 0
    else
        echo "⚠️  CLI import had issues (exit code: $result)"
        echo "   This might be normal if some workflows already exist"
        return $result
    fi
}

# Function to copy workflows to n8n data directory
prepare_workflows() {
    echo "📂 Preparing workflows for import..."
    
    # Create workflows directory in n8n data
    local n8n_workflows_dir="$PROJECT_ROOT/data/n8n/workflows"
    mkdir -p "$n8n_workflows_dir"
    
    # Copy all JSON files to the workflows directory
    echo "📁 Copying workflow files..."
    
    local count=0
    find "$N8N_DIR" -name "*.json" -type f | while read -r file; do
        local filename=$(basename "$file")
        local target="$n8n_workflows_dir/$filename"
        
        # Copy file
        cp "$file" "$target"
        count=$((count + 1))
        
        echo "   📄 Copied: $filename"
    done
    
    local total=$(find "$N8N_DIR" -name "*.json" -type f | wc -l)
    echo "📊 Prepared $total workflow files for import"
}

# Function to import workflows one by one (fallback method)
import_workflows_individual() {
    echo "🔄 Importing workflows individually..."
    
    local n8n_workflows_dir="$PROJECT_ROOT/data/n8n/workflows"
    local success=0
    local failed=0
    local total=0
    
    find "$n8n_workflows_dir" -name "*.json" -type f | sort | while read -r file; do
        total=$((total + 1))
        local filename=$(basename "$file")
        
        echo "[$total] Importing: $filename"
        
        if docker exec sbs-n8n-1 n8n import:workflow --input="/home/node/.n8n/workflows/$filename" 2>/dev/null; then
            echo "✅ $filename imported successfully"
            success=$((success + 1))
        else
            echo "⚠️  $filename import failed (might already exist)"
            failed=$((failed + 1))
        fi
        
        sleep 0.1
    done
    
    echo ""
    echo "📊 Individual Import Results:"
    echo "   ✅ Successful: $success"
    echo "   ⚠️  Failed/Skipped: $failed"
}

# Function to list imported workflows
list_imported_workflows() {
    echo "📋 Listing imported workflows..."
    
    if docker exec sbs-n8n-1 n8n list:workflow 2>/dev/null; then
        echo "✅ Workflow list retrieved successfully"
    else
        echo "⚠️  Could not retrieve workflow list"
    fi
}

# Main execution
main() {
    echo "🔧 Starting CLI-based workflow import..."
    
    # Wait for n8n to be ready
    if ! wait_for_n8n; then
        echo "❌ n8n is not responding - ensure Docker containers are running"
        exit 1
    fi
    
    # Prepare workflows for import
    prepare_workflows
    
    # Try bulk import first
    echo ""
    echo "🚀 Attempting bulk import..."
    if import_workflows_cli; then
        echo "🎉 Bulk import successful!"
    else
        echo "🔄 Bulk import had issues, trying individual imports..."
        import_workflows_individual
    fi
    
    # List imported workflows
    echo ""
    list_imported_workflows
    
    echo ""
    echo "✅ Import process complete!"
    echo "🌐 View your workflows at: $N8N_URL"
    
    # Clean up temporary files
    # rm -rf "$PROJECT_ROOT/data/n8n/workflows" 2>/dev/null || true
}

main "$@"
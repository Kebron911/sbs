#!/bin/bash

# Auto-setup n8n and import all workflows
# Usage: ./auto-import-workflows.sh

set -e

N8N_URL="http://localhost:15678"
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"

echo "🚀 N8N Auto-Import Setup"
echo "======================="

# Function to wait for n8n to be ready
wait_for_n8n() {
    echo "⏳ Waiting for n8n to be fully ready..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "$N8N_URL/healthz" | grep -q "ok"; then
            echo "✅ n8n is healthy"
            return 0
        fi
        echo "   Attempt $((attempt + 1))/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ n8n failed to become ready"
    return 1
}

# Function to check if n8n needs setup
check_n8n_setup() {
    local response=$(curl -s "$N8N_URL/rest/login" -H "Content-Type: application/json" -d '{}' || echo "connection_failed")
    
    if echo "$response" | grep -q "Setup n8n"; then
        echo "🔧 n8n needs initial setup"
        return 1  # Needs setup
    elif echo "$response" | grep -q "Missing parameters"; then
        echo "✅ n8n is set up, ready for workflows"
        return 0  # Already set up
    else
        echo "⚠️  n8n status unclear, proceeding with workflow import"
        return 0
    fi
}

# Function to auto-configure n8n (skip user setup for automation)
auto_setup_n8n() {
    echo "🔧 Auto-configuring n8n for workflow automation..."
    
    # Create a basic user for automation (if needed)
    # This might not work in newer n8n versions, but we'll try
    local setup_data='{
        "email": "admin@localhost", 
        "firstName": "Admin", 
        "lastName": "User", 
        "password": "admin123",
        "agree": true
    }'
    
    local response=$(curl -s -X POST "$N8N_URL/rest/owner/setup" \
        -H "Content-Type: application/json" \
        -d "$setup_data" || echo "setup_failed")
    
    if echo "$response" | grep -q "error\|Setup"; then
        echo "⚠️  Auto-setup may have failed, but continuing..."
        echo "   You may need to manually set up n8n at $N8N_URL"
        echo "   Then re-run this script"
        return 1
    else
        echo "✅ Auto-setup completed"
        return 0
    fi
}

# Function to import a single workflow without authentication
import_workflow_direct() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "📄 Processing: $filename"
    
    # Validate JSON first
    if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "❌ Invalid JSON in: $filename"
        return 1
    fi
    
    # Try direct POST to workflows endpoint
    local response=$(curl -s -X POST "$N8N_URL/rest/workflows" \
        -H "Content-Type: application/json" \
        -d @"$file" 2>/dev/null || echo "request_failed")
    
    if echo "$response" | grep -q '"id":\|"name":'; then
        local workflow_id=$(echo "$response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', 'unknown'))" 2>/dev/null || echo "unknown")
        echo "✅ Success! Workflow ID: $workflow_id"
        return 0
    elif echo "$response" | grep -q "Unauthorized\|Authentication"; then
        echo "🔐 Authentication required for: $filename"
        return 2  # Auth needed
    else
        echo "❌ Failed: $filename - $response"
        return 1
    fi
}

# Function to try alternative import methods
try_alternative_import() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "🔄 Trying alternative import for: $filename"
    
    # Method 1: Try with different endpoints
    for endpoint in "/rest/workflows/import" "/api/v1/workflows" "/webhook/import-workflow"; do
        local response=$(curl -s -X POST "$N8N_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d @"$file" 2>/dev/null || echo "failed")
        
        if echo "$response" | grep -q '"id":\|"success":true'; then
            echo "✅ Success via $endpoint"
            return 0
        fi
    done
    
    # Method 2: Try file-based import (if n8n supports it)
    local n8n_container=$(docker ps --format "table {{.Names}}" | grep n8n | head -1)
    if [ -n "$n8n_container" ]; then
        echo "📁 Trying container file copy for: $filename"
        docker cp "$file" "$n8n_container:/tmp/$filename" 2>/dev/null || true
    fi
    
    return 1
}

# Main execution
main() {
    if ! wait_for_n8n; then
        echo "❌ Cannot proceed - n8n is not ready"
        exit 1
    fi
    
    # Check if we can import workflows directly
    echo "🔍 Testing workflow import capability..."
    
    # Find a test workflow to try
    local test_file=$(find "$N8N_DIR" -name "*.json" -type f | head -1)
    if [ -z "$test_file" ]; then
        echo "❌ No workflow files found in $N8N_DIR"
        exit 1
    fi
    
    # Test import
    local test_result
    if import_workflow_direct "$test_file"; then
        echo "🎉 Direct import works! Proceeding with all workflows..."
        test_result="success"
    else
        local exit_code=$?
        if [ $exit_code -eq 2 ]; then
            echo "🔐 Authentication required. Attempting auto-setup..."
            if ! auto_setup_n8n; then
                echo ""
                echo "⚠️  Manual Setup Required:"
                echo "   1. Go to $N8N_URL"
                echo "   2. Complete the initial setup"
                echo "   3. Re-run this script"
                echo ""
                exit 1
            fi
            test_result="retry_needed"
        else
            echo "⚠️  Direct import failed, will try alternatives"
            test_result="alternatives"
        fi
    fi
    
    # Import all workflows
    echo ""
    echo "📂 Scanning for all workflows in: $N8N_DIR"
    
    local total_count=0
    local success_count=0
    local auth_needed_count=0
    local failed_count=0
    
    while IFS= read -r -d '' file; do
        total_count=$((total_count + 1))
        echo ""
        echo "📁 Processing: ${file#$PROJECT_ROOT/}"
        
        local result=0
        if [ "$test_result" = "success" ] || [ "$test_result" = "retry_needed" ]; then
            import_workflow_direct "$file"
            result=$?
        else
            try_alternative_import "$file"
            result=$?
        fi
        
        case $result in
            0) success_count=$((success_count + 1)) ;;
            2) auth_needed_count=$((auth_needed_count + 1)) ;;
            *) failed_count=$((failed_count + 1)) ;;
        esac
        
    done < <(find "$N8N_DIR" -name "*.json" -type f -print0)
    
    # Summary
    echo ""
    echo "📊 Import Summary:"
    echo "   Total workflows: $total_count"
    echo "   ✅ Successfully imported: $success_count"
    echo "   🔐 Authentication needed: $auth_needed_count"
    echo "   ❌ Failed: $failed_count"
    
    if [ $success_count -eq $total_count ]; then
        echo "🎉 All workflows imported successfully!"
    elif [ $auth_needed_count -gt 0 ]; then
        echo "🔐 Some workflows need authentication setup"
        echo "   Please complete n8n setup at: $N8N_URL"
    else
        echo "⚠️  Some imports failed - check individual workflow JSON files"
    fi
}

# Run main function
main "$@"
#!/bin/bash

# Real N8N Workflow Importer with Proper API Handling
# This script properly imports workflows using n8n's REST API

set -e

N8N_URL="http://localhost:15678"
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"

echo "🚀 N8N Workflow Importer (Fixed)"
echo "================================="

# Function to check n8n status
check_n8n_status() {
    echo "🔍 Checking n8n status..."
    
    # Check health
    if ! curl -s "$N8N_URL/healthz" | grep -q "ok"; then
        echo "❌ n8n health check failed"
        return 1
    fi
    
    # Check if setup is needed
    local setup_check=$(curl -s "$N8N_URL/" | head -20)
    if echo "$setup_check" | grep -q "Setup n8n\|setup"; then
        echo "⚠️  n8n requires initial setup"
        echo "   Please visit: $N8N_URL"
        echo "   Complete setup and run this script again"
        return 2
    fi
    
    # Try to access workflows endpoint
    local auth_check=$(curl -s -w "%{http_code}" "$N8N_URL/rest/workflows" -o /dev/null)
    case "$auth_check" in
        200) echo "✅ n8n is ready for workflow import" ;;
        401) echo "🔐 n8n requires authentication" && return 3 ;;
        *) echo "⚠️  Unexpected response code: $auth_check" ;;
    esac
    
    return 0
}

# Function to get current workflows for comparison
get_existing_workflows() {
    local response=$(curl -s "$N8N_URL/rest/workflows" 2>/dev/null || echo "failed")
    if echo "$response" | grep -q "\[.*\]"; then
        echo "$response" | python3 -c "
import sys, json
try:
    workflows = json.load(sys.stdin)
    if isinstance(workflows, list):
        for w in workflows:
            print(f\"{w.get('name', 'unnamed')} (ID: {w.get('id', 'unknown')})\")
    else:
        print('No workflows or unexpected format')
except:
    print('Failed to parse workflows')
" 2>/dev/null
    else
        echo "No workflows found or API error"
    fi
}

# Function to import a single workflow with proper error handling
import_workflow_proper() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "📄 Importing: $filename"
    
    # Validate JSON structure
    if ! python3 -c "
import json, sys
try:
    with open('$file', 'r') as f:
        data = json.load(f)
    if 'nodes' not in data:
        print('Missing nodes array')
        sys.exit(1)
    if 'name' not in data:
        print('Missing workflow name')
        sys.exit(1)
    print('Valid workflow structure')
except Exception as e:
    print(f'Invalid JSON: {e}')
    sys.exit(1)
" 2>/dev/null; then
        echo "❌ Invalid workflow structure"
        return 1
    fi
    
    # Import using n8n REST API
    local response=$(curl -s -X POST "$N8N_URL/rest/workflows" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        --data-binary @"$file" 2>/dev/null || echo "curl_failed")
    
    # Check response
    if echo "$response" | grep -q '"id":'; then
        local workflow_id=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', 'unknown'))
except:
    print('parse_error')
" 2>/dev/null)
        echo "✅ Success! ID: $workflow_id"
        return 0
    elif echo "$response" | grep -q "Unauthorized\|Authentication"; then
        echo "🔐 Authentication required"
        return 2
    elif echo "$response" | grep -q "error\|Error"; then
        local error_msg=$(echo "$response" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('message', 'Unknown error'))
except:
    print('$response')
" 2>/dev/null)
        echo "❌ Error: $error_msg"
        return 1
    else
        echo "❌ Unexpected response: $response"
        return 1
    fi
}

# Function to setup n8n for automation (if possible)
setup_n8n_for_automation() {
    echo "🔧 Attempting to configure n8n for automation..."
    
    # Try to create an initial user if none exists
    local setup_response=$(curl -s -X POST "$N8N_URL/rest/owner/setup" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@localhost",
            "firstName": "Admin", 
            "lastName": "User",
            "password": "admin123456",
            "agree": true
        }' 2>/dev/null || echo "setup_failed")
    
    if echo "$setup_response" | grep -q '"id":\|"email":'; then
        echo "✅ Created admin user for automation"
        return 0
    else
        echo "⚠️  Could not auto-setup. Manual setup required."
        return 1
    fi
}

# Main execution
main() {
    # Check n8n status
    local status_result
    if ! check_n8n_status; then
        status_result=$?
        if [ $status_result -eq 2 ]; then
            # Try auto-setup
            if setup_n8n_for_automation; then
                echo "🔄 Retrying after setup..."
                sleep 3
                if ! check_n8n_status; then
                    echo "❌ Setup failed"
                    exit 1
                fi
            else
                exit 1
            fi
        elif [ $status_result -eq 3 ]; then
            echo "❌ Authentication required - please setup n8n manually"
            exit 1
        else
            echo "❌ n8n is not ready"
            exit 1
        fi
    fi
    
    # Show existing workflows
    echo ""
    echo "📋 Current workflows in n8n:"
    get_existing_workflows
    echo ""
    
    # Find and import workflows
    echo "🔍 Scanning for JSON workflows..."
    if [ ! -d "$N8N_DIR" ]; then
        echo "❌ Directory not found: $N8N_DIR"
        exit 1
    fi
    
    local workflow_files=($(find "$N8N_DIR" -name "*.json" -type f | sort))
    local total=${#workflow_files[@]}
    
    if [ $total -eq 0 ]; then
        echo "❌ No JSON workflow files found"
        exit 1
    fi
    
    echo "📊 Found $total workflow files"
    echo ""
    
    # Import workflows
    local success=0
    local failed=0
    local auth_needed=0
    local current=0
    
    for file in "${workflow_files[@]}"; do
        current=$((current + 1))
        echo "[$current/$total] ${file#$PROJECT_ROOT/}"
        
        local result
        import_workflow_proper "$file"
        result=$?
        
        case $result in
            0) success=$((success + 1)) ;;
            2) auth_needed=$((auth_needed + 1)) ;;
            *) failed=$((failed + 1)) ;;
        esac
        
        # Brief pause between imports
        sleep 0.2
    done
    
    # Summary
    echo ""
    echo "📊 Import Summary:"
    echo "   Total: $total"
    echo "   ✅ Success: $success"
    echo "   🔐 Auth needed: $auth_needed"  
    echo "   ❌ Failed: $failed"
    
    if [ $success -eq $total ]; then
        echo "🎉 All workflows imported successfully!"
    elif [ $success -gt 0 ]; then
        echo "✅ Partial success"
    else
        echo "❌ No workflows were imported"
        if [ $auth_needed -gt 0 ]; then
            echo "   Setup n8n at: $N8N_URL"
        fi
        exit 1
    fi
    
    echo ""
    echo "🌐 Check your workflows at: $N8N_URL"
}

main "$@"
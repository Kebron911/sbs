#!/bin/bash

# Authenticated N8N Workflow Importer
# This script handles n8n authentication and imports workflows properly

set -e

N8N_URL="http://localhost:15678"
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"

echo "🚀 Authenticated N8N Workflow Importer"
echo "======================================"

# Function to get authentication cookie/token
get_auth_token() {
    echo "🔐 Getting authentication token..."
    
    # Try to get current session info
    local session_response=$(curl -s -c /tmp/n8n_cookies.txt "$N8N_URL/rest/login" || echo "failed")
    
    if echo "$session_response" | grep -q "loggedIn.*true"; then
        echo "✅ Already authenticated"
        return 0
    fi
    
    echo "⚠️  Authentication required"
    echo "   Please ensure you're logged into n8n at: $N8N_URL"
    echo "   Then try running this script again"
    return 1
}

# Function to import with authentication
import_workflow_auth() {
    local file="$1"
    local filename=$(basename "$file" .json)
    
    echo "📄 Importing: $filename"
    
    # Check if file is valid JSON
    if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "❌ Invalid JSON format"
        return 1
    fi
    
    # Import using cookies for authentication
    local response=$(curl -s -X POST "$N8N_URL/rest/workflows" \
        -b /tmp/n8n_cookies.txt \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        --data-binary @"$file" 2>/dev/null)
    
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
        echo "🔐 Authentication failed"
        return 2
    elif echo "$response" | grep -q "<!DOCTYPE html>"; then
        echo "❌ Server error (HTML response)"
        return 1
    else
        echo "❌ Import failed: $response"
        return 1
    fi
}

# Alternative import method using browser session simulation
import_via_browser_session() {
    local file="$1"
    local filename=$(basename "$file" .json)
    
    echo "🌐 Trying browser session import for: $filename"
    
    # Get the main page first to establish session
    curl -s -c /tmp/n8n_session.txt "$N8N_URL/" > /dev/null
    
    # Try the workflow import
    local response=$(curl -s -X POST "$N8N_URL/rest/workflows" \
        -b /tmp/n8n_session.txt \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        -H "Referer: $N8N_URL/" \
        --data-binary @"$file")
    
    if echo "$response" | grep -q '"id":'; then
        echo "✅ Success via browser session!"
        return 0
    else
        return 1
    fi
}

# Function to manually guide import process
guide_manual_import() {
    echo ""
    echo "🔧 Manual Import Process:"
    echo "========================================"
    echo ""
    echo "Since automated import is having authentication issues,"
    echo "here's how to import your workflows manually:"
    echo ""
    echo "1. 📂 Open n8n: $N8N_URL"
    echo "2. 🔘 Click 'Create Workflow' or '+' button"
    echo "3. ⚙️  Click the workflow menu (3 dots) → 'Import from File'"
    echo "4. 📁 Navigate to your workflow files in:"
    echo "   $N8N_DIR"
    echo ""
    echo "📋 Key workflows to import first:"
    
    # List important workflows
    local key_workflows=(
        "administration/admin_scoring_override.json"
        "administration/database_maintenance.json"
        "subflows/validation_responses/validate_input.json"
        "subflows/database_operations/database_query.json"
        "core_systems/orchestrator.json"
    )
    
    for workflow in "${key_workflows[@]}"; do
        local full_path="$N8N_DIR/$workflow"
        if [ -f "$full_path" ]; then
            echo "   📄 $workflow"
        fi
    done
    
    echo ""
    echo "💡 Pro tip: Import subflows first, then main workflows"
    echo "   This ensures dependencies are available"
}

# Main execution
main() {
    # Check if n8n is responding
    if ! curl -s "$N8N_URL/healthz" | grep -q "ok"; then
        echo "❌ n8n is not responding"
        exit 1
    fi
    
    echo "✅ n8n is responding"
    
    # Try to get authentication
    if ! get_auth_token; then
        echo ""
        echo "🔧 Attempting alternative authentication methods..."
        
        # Try browser session method for one file as test
        local test_file=$(find "$N8N_DIR" -name "*.json" -type f | head -1)
        if [ -n "$test_file" ] && import_via_browser_session "$test_file"; then
            echo "✅ Browser session method works!"
            
            # Continue with all files
            echo "🔄 Importing all workflows..."
            local success=0
            local total=0
            
            find "$N8N_DIR" -name "*.json" -type f | while read -r file; do
                total=$((total + 1))
                if import_via_browser_session "$file"; then
                    success=$((success + 1))
                fi
                sleep 0.2
            done
            
            echo "📊 Import summary: $success/$total successful"
        else
            echo "❌ Automated import methods failed"
            guide_manual_import
        fi
        return
    fi
    
    # Import workflows with authentication
    echo "🔍 Scanning for workflows..."
    local workflow_files=($(find "$N8N_DIR" -name "*.json" -type f | sort))
    local total=${#workflow_files[@]}
    
    echo "📊 Found $total workflow files"
    echo ""
    
    local success=0
    local auth_failed=0
    local other_failed=0
    local current=0
    
    for file in "${workflow_files[@]}"; do
        current=$((current + 1))
        echo "[$current/$total] $(basename "$file")"
        
        local result
        import_workflow_auth "$file"
        result=$?
        
        case $result in
            0) success=$((success + 1)) ;;
            2) auth_failed=$((auth_failed + 1)) ;;
            *) other_failed=$((other_failed + 1)) ;;
        esac
        
        sleep 0.1
    done
    
    # Summary
    echo ""
    echo "📊 Final Results:"
    echo "   Total workflows: $total"
    echo "   ✅ Successfully imported: $success"
    echo "   🔐 Authentication failed: $auth_failed"
    echo "   ❌ Other failures: $other_failed"
    
    if [ $success -eq $total ]; then
        echo "🎉 All workflows imported successfully!"
    elif [ $auth_failed -gt 0 ]; then
        echo "⚠️  Some workflows failed due to authentication"
        guide_manual_import
    else
        echo "⚠️  Some workflows failed to import"
    fi
    
    echo ""
    echo "🌐 Check your workflows at: $N8N_URL"
    
    # Cleanup
    rm -f /tmp/n8n_cookies.txt /tmp/n8n_session.txt
}

main "$@"
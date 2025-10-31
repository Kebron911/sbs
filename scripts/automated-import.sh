#!/bin/bash

# Automated N8N Workflow Importer with API Key Authentication
# This script provides full automation for workflow imports and live sync

set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"
N8N_URL="http://localhost:15678"

# Load environment variables
if [ -f "$PROJECT_ROOT/.env" ]; then
    while IFS='=' read -r key value || [ -n "$key" ]; do
        # Skip empty lines and comments
        [[ -z "$key" || "$key" =~ ^[[:space:]]*# ]] && continue
        
        # Remove leading/trailing whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)
        
        # Skip lines that don't look like valid env vars
        [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
        
        # Export the variable
        export "$key=$value"
    done < "$PROJECT_ROOT/.env"
fi

echo "🚀 Automated N8N Workflow Importer"
echo "==================================="

# Check if API key is configured
if [ -z "$N8N_API_KEY" ]; then
    echo "❌ N8N_API_KEY not found in .env file"
    echo "   Please ensure the API key is configured in your .env file"
    exit 1
fi

echo "✅ API Key configured"

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

# Function to test API authentication
test_api_auth() {
    echo "🔐 Testing API authentication..."
    
    local response=$(curl -s -w "%{http_code}" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Accept: application/json" \
        "$N8N_URL/rest/workflows" \
        -o /tmp/n8n_test_response.json)
    
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        echo "✅ API authentication successful"
        return 0
    elif [ "$http_code" = "401" ]; then
        echo "❌ API authentication failed - invalid API key"
        return 1
    elif [ "$http_code" = "404" ]; then
        echo "❌ API endpoint not found - ensure n8n API is enabled"
        return 1
    else
        echo "❌ API test failed with HTTP code: $http_code"
        cat /tmp/n8n_test_response.json 2>/dev/null || true
        return 1
    fi
}

# Function to import a single workflow
import_workflow() {
    local file="$1"
    local filename=$(basename "$file" .json)
    
    echo "📄 Importing: $filename"
    
    # Validate JSON
    if ! python3 -m json.tool "$file" > /dev/null 2>&1; then
        echo "❌ Invalid JSON format"
        return 1
    fi
    
    # Import workflow
    local response=$(curl -s -w "%{http_code}" \
        -X POST "$N8N_URL/rest/workflows" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -H "Content-Type: application/json" \
        -H "Accept: application/json" \
        --data-binary @"$file" \
        -o /tmp/n8n_import_response.json)
    
    local http_code="${response: -3}"
    local response_body=$(cat /tmp/n8n_import_response.json 2>/dev/null || echo "{}")
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        local workflow_id=$(echo "$response_body" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('id', 'unknown'))
except:
    print('parse_error')
" 2>/dev/null)
        echo "✅ Success! ID: $workflow_id"
        return 0
    elif [ "$http_code" = "400" ]; then
        local error_msg=$(echo "$response_body" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(data.get('message', 'Bad request'))
except:
    print('Bad request')
" 2>/dev/null)
        echo "❌ Import failed: $error_msg"
        return 1
    elif [ "$http_code" = "401" ]; then
        echo "❌ Authentication failed"
        return 2
    else
        echo "❌ Import failed (HTTP $http_code): $response_body"
        return 1
    fi
}

# Function to get import order
get_import_order() {
    local -a import_order=()
    
    # 1. Critical subflows first
    local critical_subflows=(
        "subflows/validation_responses/validate_input.json"
        "subflows/database_operations/database_query.json"
        "subflows/database_operations/database_transaction_handler.json"
        "subflows/communication/send_telegram_response.json" 
        "subflows/communication/telegram_command_parser.json"
        "subflows/logging_events/log_event.json"
        "subflows/character_management/character_data_fetching.json"
    )
    
    for workflow in "${critical_subflows[@]}"; do
        local full_path="$N8N_DIR/$workflow"
        if [ -f "$full_path" ]; then
            import_order+=("$full_path")
        fi
    done
    
    # 2. Remaining subflows
    while IFS= read -r -d '' file; do
        local rel_path="${file#$N8N_DIR/}"
        if [[ "$rel_path" == subflows/* ]] && ! printf '%s\n' "${critical_subflows[@]}" | grep -q "^$rel_path$"; then
            import_order+=("$file")
        fi
    done < <(find "$N8N_DIR/subflows" -name "*.json" -type f -print0 | sort -z)
    
    # 3. Core systems
    while IFS= read -r -d '' file; do
        import_order+=("$file")
    done < <(find "$N8N_DIR/core_systems" -name "*.json" -type f -print0 | sort -z)
    
    # 4. Game engines
    while IFS= read -r -d '' file; do
        import_order+=("$file")
    done < <(find "$N8N_DIR/game_engines" -name "*.json" -type f -print0 | sort -z)
    
    # 5. Administration and user interfaces
    while IFS= read -r -d '' file; do
        import_order+=("$file")
    done < <(find "$N8N_DIR/administration" "$N8N_DIR/user_interfaces" -name "*.json" -type f -print0 2>/dev/null | sort -z)
    
    # 6. AI workflows and remaining
    while IFS= read -r -d '' file; do
        local rel_path="${file#$N8N_DIR/}"
        if [[ "$rel_path" == ai_workflows/* ]] || [[ "$rel_path" == testing_development/* ]]; then
            import_order+=("$file")
        fi
    done < <(find "$N8N_DIR" -name "*.json" -type f -print0 | sort -z)
    
    # Remove duplicates while preserving order
    local -a unique_order=()
    local -A seen=()
    
    for file in "${import_order[@]}"; do
        if [[ -z "${seen[$file]}" ]]; then
            unique_order+=("$file")
            seen["$file"]=1
        fi
    done
    
    printf '%s\n' "${unique_order[@]}"
}

# Function to perform bulk import
bulk_import() {
    echo "🔍 Scanning workflows in optimal order..."
    
    local -a workflow_files
    readarray -t workflow_files < <(get_import_order)
    
    local total=${#workflow_files[@]}
    echo "📊 Found $total workflow files to import"
    echo ""
    
    local success=0
    local failed=0
    local auth_failed=0
    local current=0
    
    for file in "${workflow_files[@]}"; do
        if [ ! -f "$file" ]; then
            continue
        fi
        
        current=$((current + 1))
        local rel_path="${file#$N8N_DIR/}"
        echo "[$current/$total] $rel_path"
        
        local result
        import_workflow "$file"
        result=$?
        
        case $result in
            0) success=$((success + 1)) ;;
            2) auth_failed=$((auth_failed + 1)) ;;
            *) failed=$((failed + 1)) ;;
        esac
        
        # Small delay to avoid overwhelming the API
        sleep 0.2
    done
    
    # Summary
    echo ""
    echo "📊 Import Results:"
    echo "   Total workflows: $total"
    echo "   ✅ Successfully imported: $success"
    echo "   ❌ Failed to import: $failed"
    echo "   🔐 Authentication failures: $auth_failed"
    
    if [ $success -eq $total ]; then
        echo "🎉 All workflows imported successfully!"
    elif [ $auth_failed -gt 0 ]; then
        echo "⚠️  Authentication issues detected - check API key configuration"
    else
        echo "⚠️  Some workflows failed to import - check logs above"
    fi
    
    echo ""
    echo "🌐 View your workflows at: $N8N_URL"
}

# Main execution
main() {
    echo "🔧 Starting automated workflow import..."
    
    # Wait for n8n to be ready
    if ! wait_for_n8n; then
        echo "❌ n8n is not responding - ensure Docker containers are running"
        exit 1
    fi
    
    # Test API authentication
    if ! test_api_auth; then
        echo ""
        echo "🔄 Restarting n8n to apply API configuration..."
        docker compose restart n8n
        
        echo "⏳ Waiting for n8n to restart..."
        sleep 10
        
        if ! wait_for_n8n; then
            echo "❌ n8n failed to restart properly"
            exit 1
        fi
        
        if ! test_api_auth; then
            echo "❌ API authentication still failing after restart"
            echo "   Check your .env file and docker-compose.yml configuration"
            exit 1
        fi
    fi
    
    # Perform bulk import
    bulk_import
    
    # Cleanup
    rm -f /tmp/n8n_*.json
    
    echo ""
    echo "✅ Automated import complete!"
}

main "$@"
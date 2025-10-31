#!/bin/bash

# Init User Setup Workflow Tester
# Tests the fixed INIT_USER_SETUP workflow

N8N_URL="http://localhost:15678"
WEBHOOK_URL="$N8N_URL/webhook/user-signup"

echo "🧪 Init User Setup Workflow Tester"
echo "=================================="

# Function to test the workflow
test_user_setup() {
    local test_user_id=$1
    local test_class=$2
    local test_bio="$3"
    local test_goals="$4"
    
    echo "🚀 Testing user setup workflow..."
    echo "   User ID: $test_user_id"
    echo "   Class: $test_class"
    echo "   Bio: $test_bio"
    echo "   Goals: $test_goals"
    echo ""
    
    # Create test payload
    local test_payload=$(cat <<EOF
{
  "user_id": $test_user_id,
  "class": "$test_class",
  "bio": "$test_bio",
  "goals": "$test_goals"
}
EOF
)
    
    echo "📤 Sending test request..."
    local response=$(curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$test_payload")
    
    echo "📥 Response received:"
    echo "$response" | jq . 2>/dev/null || echo "$response"
    
    # Check if successful
    if echo "$response" | jq -e '.success == true' > /dev/null 2>&1; then
        local character_id=$(echo "$response" | jq -r '.characterId')
        local system_id=$(echo "$response" | jq -r '.starterSystemId // "none"')
        
        echo ""
        echo "✅ Test PASSED!"
        echo "   Character ID: $character_id"
        echo "   Starter System ID: $system_id"
        echo "   Message: $(echo "$response" | jq -r '.message')"
        return 0
    else
        echo ""
        echo "❌ Test FAILED!"
        local error=$(echo "$response" | jq -r '.error // "Unknown error"')
        echo "   Error: $error"
        return 1
    fi
}

# Function to test validation errors
test_validation_errors() {
    echo ""
    echo "🔍 Testing validation errors..."
    
    # Test missing user_id
    echo "   Testing missing user_id..."
    local response1=$(curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"class": "warrior"}')
    
    if echo "$response1" | jq -e '.success == false' > /dev/null 2>&1; then
        echo "   ✅ Missing user_id properly rejected"
    else
        echo "   ❌ Missing user_id validation failed"
    fi
    
    # Test missing class
    echo "   Testing missing class..."
    local response2=$(curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"user_id": 999}')
    
    if echo "$response2" | jq -e '.success == false' > /dev/null 2>&1; then
        echo "   ✅ Missing class properly rejected"
    else
        echo "   ❌ Missing class validation failed"
    fi
}

# Function to check workflow status
check_workflow_status() {
    echo ""
    echo "🔍 Checking workflow status..."
    
    # Check if n8n is responding
    if ! curl -s "$N8N_URL/healthz" | grep -q "ok"; then
        echo "❌ n8n is not responding"
        return 1
    fi
    
    echo "✅ n8n is responding"
    
    # Check webhook endpoint
    local webhook_response=$(curl -s -o /dev/null -w "%{http_code}" "$WEBHOOK_URL")
    if [ "$webhook_response" = "404" ]; then
        echo "❌ Webhook endpoint not found - workflow may not be active"
        echo "💡 Try activating the INIT_USER_SETUP workflow in n8n"
        return 1
    elif [ "$webhook_response" = "405" ]; then
        echo "✅ Webhook endpoint is active (expecting POST requests)"
    else
        echo "⚠️  Webhook returned HTTP $webhook_response"
    fi
    
    return 0
}

# Function to show workflow fixes
show_fixes_applied() {
    echo ""
    echo "🔧 Fixes Applied to INIT_USER_SETUP Workflow:"
    echo "=============================================="
    echo ""
    echo "✅ Added missing query parameters to all database operations:"
    echo "   • Create Character - now properly binds user_id, class, bio, goals"
    echo "   • Insert Skills - properly binds character_id and skill data"
    echo "   • Create Tutorial Quest - binds character_id"
    echo "   • Insert Tutorial Tasks - binds project_id and task data"
    echo "   • Create Default Settings - binds user_id"
    echo "   • Insert Starter Items - binds character_id and item data"
    echo "   • Log Onboarding Event - binds character_id"
    echo ""
    echo "✅ Fixed SBS Creation Success validation:"
    echo "   • Now checks for system_id presence OR routines_created > 0"
    echo "   • Uses logical OR instead of strict boolean check"
    echo "   • More flexible validation for different response formats"
    echo ""
    echo "✅ Updated webhook URLs to use environment variables:"
    echo "   • Uses \$vars.N8N_WEBHOOK_BASE_URL instead of hardcoded localhost"
    echo "   • More flexible for different deployment environments"
    echo ""
    echo "✅ Maintained all existing workflow logic and connections"
    echo ""
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Check workflow status"
    echo "2) Run full test (creates test user)"
    echo "3) Test validation errors"
    echo "4) Show applied fixes"
    echo "5) Exit"
    echo ""
    read -p "Enter choice [1-5]: " choice
    
    case $choice in
        1) 
            check_workflow_status
            ;;
        2) 
            echo ""
            echo "🧪 Running full test..."
            local test_id=$((RANDOM + 1000))
            test_user_setup $test_id "warrior" "A brave adventurer seeking growth" "Master healthy habits and build mental strength"
            ;;
        3) 
            test_validation_errors
            ;;
        4) 
            show_fixes_applied
            ;;
        5) 
            echo "👋 Goodbye!"
            exit 0
            ;;
        *) 
            echo "Invalid choice. Please try again."
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Main execution
main() {
    echo "🔧 INIT_USER_SETUP workflow has been fixed and reimported!"
    echo ""
    echo "🎯 Key Issues Resolved:"
    echo "   • Missing database query parameters"
    echo "   • SBS Creation Success validation logic"
    echo "   • Webhook URL configuration"
    echo ""
    
    check_workflow_status
    show_menu
}

main "$@"
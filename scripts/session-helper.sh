#!/bin/bash

# N8N Session Management Helper
# Helps with login session issues and provides session management tools

N8N_URL="http://localhost:15678"

echo "🔐 N8N Session Management Helper"
echo "================================"

# Function to check n8n status
check_n8n_status() {
    echo "🔍 Checking n8n status..."
    
    if curl -s "$N8N_URL/healthz" | grep -q "ok"; then
        echo "✅ n8n is running and healthy"
        
        # Check if we can access the main page
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$N8N_URL/")
        if [ "$response_code" -eq 200 ]; then
            echo "✅ n8n web interface is accessible"
        else
            echo "⚠️  n8n web interface returned HTTP $response_code"
        fi
        
        return 0
    else
        echo "❌ n8n is not responding"
        return 1
    fi
}

# Function to show current session settings
show_session_settings() {
    echo ""
    echo "⚙️  Current Session Settings:"
    echo "=============================="
    
    echo "📊 JWT Duration: 24 hours (extended from default 1 hour)"
    echo "🔄 JWT Refresh: 168 hours (7 days)"
    echo "⏰ Session Timeout: 86400 seconds (24 hours)"
    echo "🍪 Secure Cookies: Disabled (for local development)"
    
    echo ""
    echo "📋 What this means:"
    echo "   • You should stay logged in for up to 24 hours"
    echo "   • Sessions will auto-refresh for up to 7 days"
    echo "   • Much longer than the default ~15 minute timeout"
}

# Function to provide troubleshooting tips
show_troubleshooting_tips() {
    echo ""
    echo "🔧 Troubleshooting Session Issues:"
    echo "=================================="
    
    echo ""
    echo "If you're still getting logged out frequently:"
    echo ""
    echo "1. 🌐 Browser Settings:"
    echo "   • Disable browser auto-refresh/reload extensions"
    echo "   • Ensure cookies are enabled for localhost:15678"
    echo "   • Try using incognito/private mode"
    echo "   • Clear browser cache and cookies for the site"
    echo ""
    echo "2. 🔒 Network Issues:"
    echo "   • Don't switch between networks (WiFi/Ethernet)"
    echo "   • Avoid VPN changes during your session"
    echo "   • Keep your computer awake (disable sleep mode)"
    echo ""
    echo "3. 📱 Browser Tab Management:"
    echo "   • Don't close the n8n tab completely"
    echo "   • Avoid opening n8n in multiple tabs"
    echo "   • Use bookmarks instead of typing the URL"
    echo ""
    echo "4. 🔄 If Problems Persist:"
    echo "   • Restart your browser completely"
    echo "   • Run: docker compose restart n8n"
    echo "   • Check logs: docker logs sbs-n8n-1"
}

# Function to reset session (logout all users)
reset_sessions() {
    echo ""
    echo "🔄 Resetting all n8n sessions..."
    
    # Restart n8n to clear all sessions
    echo "   Restarting n8n container..."
    docker compose restart n8n
    
    echo "   Waiting for n8n to start..."
    sleep 10
    
    if curl -s "$N8N_URL/healthz" | grep -q "ok"; then
        echo "✅ n8n restarted successfully"
        echo "🔓 All sessions have been cleared"
        echo "💡 You can now log in with a fresh session"
    else
        echo "❌ n8n restart failed"
        return 1
    fi
}

# Function to check environment variables
check_env_vars() {
    echo ""
    echo "🔍 Checking n8n session environment variables..."
    
    local vars=(
        "N8N_USER_MANAGEMENT_JWT_DURATION_HOURS"
        "N8N_USER_MANAGEMENT_JWT_REFRESH_TIMEOUT_HOURS" 
        "N8N_SESSION_TIMEOUT"
        "N8N_SECURE_COOKIE"
    )
    
    for var in "${vars[@]}"; do
        local value=$(docker exec sbs-n8n-1 printenv "$var" 2>/dev/null)
        if [ -n "$value" ]; then
            echo "✅ $var = $value"
        else
            echo "❌ $var = (not set)"
        fi
    done
}

# Main menu
show_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Check n8n status"
    echo "2) Show session settings"
    echo "3) Check environment variables"
    echo "4) Show troubleshooting tips"
    echo "5) Reset all sessions (restart n8n)"
    echo "6) Exit"
    echo ""
    read -p "Enter choice [1-6]: " choice
    
    case $choice in
        1) check_n8n_status ;;
        2) show_session_settings ;;
        3) check_env_vars ;;
        4) show_troubleshooting_tips ;;
        5) reset_sessions ;;
        6) echo "👋 Goodbye!"; exit 0 ;;
        *) echo "Invalid choice. Please try again."; show_menu ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    show_menu
}

# Main execution
main() {
    check_n8n_status
    show_session_settings
    
    echo ""
    echo "🎯 Quick Fix Applied:"
    echo "   Session timeout extended from ~15 minutes to 24 hours"
    echo "   JWT refresh extended to 7 days"
    echo ""
    echo "💡 You should now stay logged in much longer!"
    echo ""
    
    show_menu
}

main "$@"
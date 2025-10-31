#!/bin/bash

# N8N Session Keep-Alive Script
# Automatically pings n8n to keep your session active

N8N_URL="http://localhost:15678"
PING_INTERVAL=300  # 5 minutes

echo "🔄 N8N Session Keep-Alive"
echo "========================"
echo "🎯 This will ping n8n every 5 minutes to keep your session active"
echo "💡 Keep this running in a separate terminal while you work"
echo ""

# Function to ping n8n
ping_n8n() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    if curl -s "$N8N_URL/healthz" | grep -q "ok"; then
        echo "[$timestamp] ✅ Session keep-alive ping successful"
        return 0
    else
        echo "[$timestamp] ❌ N8N not responding - session may have expired"
        return 1
    fi
}

# Function to run keep-alive loop
run_keep_alive() {
    echo "🚀 Starting session keep-alive..."
    echo "📊 Pinging every $PING_INTERVAL seconds"
    echo "⏹️  Press Ctrl+C to stop"
    echo ""
    
    local failure_count=0
    
    while true; do
        if ping_n8n; then
            failure_count=0
        else
            failure_count=$((failure_count + 1))
            
            if [ $failure_count -ge 3 ]; then
                echo ""
                echo "⚠️  Multiple failures detected. N8N might be down."
                echo "💡 Try restarting: docker compose restart n8n"
                echo ""
                failure_count=0
            fi
        fi
        
        sleep $PING_INTERVAL
    done
}

# Handle Ctrl+C gracefully
trap 'echo -e "\n\n🛑 Session keep-alive stopped"; exit 0' INT

# Check if n8n is running first
if ! curl -s "$N8N_URL/healthz" | grep -q "ok"; then
    echo "❌ N8N is not responding. Please start it first:"
    echo "   docker compose up -d n8n"
    exit 1
fi

# Start the keep-alive loop
run_keep_alive
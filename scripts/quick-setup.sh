#!/bin/bash

# Quick N8N Automation - One Command Solution
# Auto-imports all workflows and provides live sync

set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "🚀 N8N Quick Automation Setup"
echo "============================="

# Check if n8n is running
if ! docker ps | grep -q sbs-n8n-1; then
    echo "🔄 Starting n8n containers..."
    cd "$PROJECT_ROOT"
    docker compose up -d
    
    echo "⏳ Waiting for n8n to be ready..."
    sleep 15
fi

# Check if n8n is healthy
local max_attempts=20
local attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -s "http://localhost:15678/healthz" | grep -q "ok"; then
        echo "✅ n8n is ready!"
        break
    fi
    echo "   Waiting for n8n... ($attempt/$max_attempts)"
    sleep 3
    attempt=$((attempt + 1))
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ n8n failed to start properly"
    exit 1
fi

# Run the CLI import
echo ""
echo "📥 Importing all workflows..."
"$SCRIPT_DIR/cli-import.sh" | tail -20

# Show results
echo ""
echo "📊 Final Status:"
local workflow_count=$(docker exec sbs-n8n-1 n8n list:workflow 2>/dev/null | wc -l || echo "0")
echo "   Workflows imported: $workflow_count"
echo "   n8n Interface: http://localhost:15678"

echo ""
echo "🎯 Next Steps:"
echo "1. Open http://localhost:15678 to view your workflows"
echo "2. Run './scripts/live-sync.sh' for auto-sync when editing files"
echo "3. Edit any JSON file in n8n/ directory and it will auto-import"

echo ""
echo "✅ Automated workflow import complete!"
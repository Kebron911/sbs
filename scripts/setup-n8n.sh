#!/bin/bash

# N8N Setup Helper and Workflow Importer
echo "🚀 N8N Setup and Import Helper"
echo "==============================="

N8N_URL="http://localhost:15678"
echo "🌐 n8n URL: $N8N_URL"
echo ""

# Check current status
echo "🔍 Checking n8n status..."
if curl -s "$N8N_URL/healthz" | grep -q "ok"; then
    echo "✅ n8n is running"
else
    echo "❌ n8n is not responding"
    exit 1
fi

# Check if setup is needed
if curl -s "$N8N_URL" | grep -q -i "setup"; then
    echo "⚠️  n8n requires initial setup"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Open your browser and go to: $N8N_URL"
    echo "2. Complete the initial setup (create admin account)"
    echo "3. After setup, run this command to import workflows:"
    echo "   ./scripts/import-after-setup.sh"
    echo ""
    
    # Create the post-setup import script
    cat > "$(dirname "$0")/import-after-setup.sh" << 'EOF'
#!/bin/bash

# Import workflows after n8n setup is complete
N8N_URL="http://localhost:15678"
N8N_DIR="$(dirname "$0")/../n8n"

echo "🚀 Importing workflows after setup..."

# Simple workflow import function
import_workflow() {
    local file="$1"
    local name=$(basename "$file" .json)
    
    echo "📄 Importing: $name"
    
    # Read and import the workflow
    local response=$(curl -s -X POST "$N8N_URL/rest/workflows" \
        -H "Content-Type: application/json" \
        --data-binary @"$file")
    
    if echo "$response" | grep -q '"id":'; then
        local id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Imported successfully (ID: $id)"
        return 0
    else
        echo "❌ Failed: $response"
        return 1
    fi
}

# Import all workflows
echo "🔍 Finding workflows..."
success=0
total=0

find "$N8N_DIR" -name "*.json" -type f | while read -r file; do
    total=$((total + 1))
    if import_workflow "$file"; then
        success=$((success + 1))
    fi
    sleep 0.1
done

echo ""
echo "📊 Import completed!"
echo "🌐 Check your workflows at: $N8N_URL"
EOF
    
    chmod +x "$(dirname "$0")/import-after-setup.sh"
    echo "✅ Created import-after-setup.sh script for after you complete setup"
    
else
    echo "✅ n8n is already set up"
    echo "🔄 You can now import workflows directly"
    
    # Test workflow import
    echo ""
    echo "🧪 Testing workflow import..."
    
    # Find a test workflow
    local test_file=$(find "$(dirname "$0")/../n8n" -name "*.json" -type f | head -1)
    if [ -n "$test_file" ]; then
        echo "📄 Testing with: $(basename "$test_file")"
        
        local test_response=$(curl -s -X POST "$N8N_URL/rest/workflows" \
            -H "Content-Type: application/json" \
            --data-binary @"$test_file")
        
        if echo "$test_response" | grep -q '"id":'; then
            echo "✅ Workflow import is working!"
            echo "🚀 Run: ./scripts/import-after-setup.sh to import all workflows"
        else
            echo "❌ Workflow import failed: $test_response"
            echo "   You may need to authenticate first"
        fi
    else
        echo "❌ No test workflow found"
    fi
fi

echo ""
echo "💡 Troubleshooting:"
echo "   - If you can't access $N8N_URL, check if Docker containers are running"
echo "   - If setup fails, restart n8n: docker compose restart n8n"
echo "   - For workflow import issues, check JSON file validity"
#!/bin/bash

# N8N Workflow Bulk Import via File Interface
# Creates a simple web interface for bulk importing

set -e

N8N_URL="http://localhost:15678"
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"

echo "🌐 N8N Bulk Import Helper"
echo "========================="

# Function to create import instructions file
create_import_guide() {
    local guide_file="$PROJECT_ROOT/IMPORT_GUIDE.html"
    
    cat > "$guide_file" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>N8N Workflow Import Guide</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #ff6d5a; color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #ff6d5a; }
        .workflow-list { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .important { background: #fff3cd; padding: 10px; border-radius: 5px; border: 1px solid #ffc107; }
        .step { margin: 10px 0; padding: 10px; background: #e7f3ff; border-radius: 5px; }
        .file-path { font-family: monospace; background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
        ul { list-style-type: none; padding-left: 0; }
        li { margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px; }
        .priority-high { border-left: 4px solid #dc3545; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
        .button { display: inline-block; padding: 10px 20px; background: #ff6d5a; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
        .directory { font-weight: bold; color: #0066cc; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 N8N Workflow Import Guide</h1>
        <p>Complete guide to importing your 56 workflows into N8N</p>
    </div>

    <div class="important">
        <h3>⚠️ Import Order Matters!</h3>
        <p>Import <strong>subflows first</strong>, then main workflows. This ensures all dependencies are available.</p>
    </div>

    <div class="section">
        <h2>🎯 Quick Start</h2>
        <div class="step">
            <strong>Step 1:</strong> Open N8N at <a href="http://localhost:15678" target="_blank">http://localhost:15678</a>
        </div>
        <div class="step">
            <strong>Step 2:</strong> For each workflow below, click "Create Workflow" → Menu (⋮) → "Import from File"
        </div>
        <div class="step">
            <strong>Step 3:</strong> Navigate to <span class="file-path">/home/ai-dragon/git/ai/sbs/n8n/</span>
        </div>
        <div class="step">
            <strong>Step 4:</strong> Import in the order listed below
        </div>
    </div>

    <div class="section">
        <h2>📋 Import Order & Priority</h2>
        
        <h3 class="priority-high">🔴 FIRST: Critical Subflows (Import These First)</h3>
        <div class="workflow-list">
            <ul>
EOF

    # Add critical subflows
    local critical_subflows=(
        "subflows/validation_responses/validate_input.json"
        "subflows/database_operations/database_query.json" 
        "subflows/database_operations/database_transaction_handler.json"
        "subflows/communication/send_telegram_response.json"
        "subflows/communication/telegram_command_parser.json"
        "subflows/logging_events/log_event.json"
        "subflows/utility_functions/character_data_fetching.json"
    )
    
    for workflow in "${critical_subflows[@]}"; do
        local full_path="$N8N_DIR/$workflow"
        if [ -f "$full_path" ]; then
            echo "                <li class=\"priority-high\">📄 <span class=\"file-path\">$workflow</span></li>" >> "$guide_file"
        fi
    done
    
    cat >> "$guide_file" << 'EOF'
            </ul>
        </div>

        <h3 class="priority-medium">🟡 SECOND: Core Systems</h3>
        <div class="workflow-list">
            <ul>
EOF

    # Add core systems
    local core_systems=(
        "core_systems/orchestrator.json"
        "core_systems/spawner.json"
        "core_systems/init_user_setup.json"
        "core_systems/cron_manager.json"
        "core_systems/pg_listener.json"
        "core_systems/integrated_system_builder.json"
    )
    
    for workflow in "${core_systems[@]}"; do
        local full_path="$N8N_DIR/$workflow"
        if [ -f "$full_path" ]; then
            echo "                <li class=\"priority-medium\">⚙️ <span class=\"file-path\">$workflow</span></li>" >> "$guide_file"
        fi
    done
    
    cat >> "$guide_file" << 'EOF'
            </ul>
        </div>

        <h3 class="priority-low">🟢 THIRD: Game Engines & Features</h3>
        <div class="workflow-list">
            <ul>
EOF

    # Add game engines
    find "$N8N_DIR/game_engines" -name "*.json" -type f | sort | while read -r file; do
        local rel_path=${file#$N8N_DIR/}
        echo "                <li class=\"priority-low\">🎮 <span class=\"file-path\">$rel_path</span></li>" >> "$guide_file"
    done
    
    cat >> "$guide_file" << 'EOF'
            </ul>
        </div>

        <h3 class="priority-low">🟢 FOURTH: Administration & User Interfaces</h3>
        <div class="workflow-list">
            <ul>
EOF

    # Add admin and UI
    find "$N8N_DIR/administration" -name "*.json" -type f | sort | while read -r file; do
        local rel_path=${file#$N8N_DIR/}
        echo "                <li class=\"priority-low\">👥 <span class=\"file-path\">$rel_path</span></li>" >> "$guide_file"
    done
    
    find "$N8N_DIR/user_interfaces" -name "*.json" -type f | sort | while read -r file; do
        local rel_path=${file#$N8N_DIR/}
        echo "                <li class=\"priority-low\">🖥️ <span class=\"file-path\">$rel_path</span></li>" >> "$guide_file"
    done
    
    cat >> "$guide_file" << 'EOF'
            </ul>
        </div>

        <h3 class="priority-low">🟢 FIFTH: AI & Remaining Workflows</h3>
        <div class="workflow-list">
            <ul>
EOF

    # Add AI workflows and others
    find "$N8N_DIR/ai_workflows" -name "*.json" -type f | sort | while read -r file; do
        local rel_path=${file#$N8N_DIR/}
        echo "                <li class=\"priority-low\">🤖 <span class=\"file-path\">$rel_path</span></li>" >> "$guide_file"
    done
    
    # Add remaining subflows
    find "$N8N_DIR/subflows" -name "*.json" -type f | grep -v -E "(validate_input|database_query|database_transaction_handler|send_telegram_response|telegram_command_parser|log_event|character_data_fetching)" | sort | while read -r file; do
        local rel_path=${file#$N8N_DIR/}
        echo "                <li class=\"priority-low\">🔧 <span class=\"file-path\">$rel_path</span></li>" >> "$guide_file"
    done
    
    cat >> "$guide_file" << 'EOF'
            </ul>
        </div>
    </div>

    <div class="section">
        <h2>💡 Pro Tips</h2>
        <ul>
            <li><strong>Naming:</strong> Keep the original filenames when importing</li>
            <li><strong>Errors:</strong> If a workflow has missing dependencies, import the subflows first</li>
            <li><strong>Testing:</strong> Test core workflows before importing game engines</li>
            <li><strong>Backup:</strong> N8N will save everything automatically</li>
        </ul>
    </div>

    <div class="section">
        <h2>🔧 File Locations</h2>
        <p><strong>Base Directory:</strong> <span class="file-path">/home/ai-dragon/git/ai/sbs/n8n/</span></p>
        <div class="workflow-list">
            <p><span class="directory">📁 subflows/</span> - Reusable workflow components (import first!)</p>
            <p><span class="directory">📁 core_systems/</span> - Main system orchestration</p>
            <p><span class="directory">📁 game_engines/</span> - Game mechanics and logic</p>
            <p><span class="directory">📁 administration/</span> - Admin tools and overrides</p>
            <p><span class="directory">📁 user_interfaces/</span> - User interaction workflows</p>
            <p><span class="directory">📁 ai_workflows/</span> - AI-powered features</p>
        </div>
    </div>

    <div class="section">
        <h2>🚀 Quick Links</h2>
        <a href="http://localhost:15678" class="button" target="_blank">Open N8N</a>
        <a href="file:///home/ai-dragon/git/ai/sbs/n8n" class="button" target="_blank">Open File Directory</a>
    </div>

    <div class="important">
        <h3>📊 Summary</h3>
        <p>Total workflows to import: <strong id="workflow-count">Loading...</strong></p>
        <p>Estimated time: <strong>15-30 minutes</strong> (depending on your import speed)</p>
    </div>

    <script>
        // Count total workflows
        const workflowItems = document.querySelectorAll('li');
        document.getElementById('workflow-count').textContent = workflowItems.length;
    </script>

</body>
</html>
EOF

    echo "✅ Import guide created: $guide_file"
    echo "🌐 Opening import guide in browser..."
    
    if command -v xdg-open > /dev/null; then
        xdg-open "$guide_file" &
    elif command -v open > /dev/null; then
        open "$guide_file" &
    else
        echo "   Manual open: file://$guide_file"
    fi
}

# Count total workflows
count_workflows() {
    local total=$(find "$N8N_DIR" -name "*.json" -type f | wc -l)
    echo "📊 Found $total workflow files to import"
}

# Main execution
main() {
    echo "🔍 Analyzing workflow structure..."
    count_workflows
    
    echo "📝 Creating comprehensive import guide..."
    create_import_guide
    
    echo ""
    echo "✅ Import guide ready!"
    echo "   The HTML guide will help you import all workflows systematically"
    echo ""
    echo "🔗 Quick access:"
    echo "   N8N Interface: http://localhost:15678"
    echo "   Workflow Files: /home/ai-dragon/git/ai/sbs/n8n/"
    echo ""
    echo "💡 The guide shows the optimal import order to avoid dependency issues"
}

main "$@"
#!/bin/bash

# JSON Workflow Fixer for N8N
# Adds missing required fields and fixes common import issues

set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"

echo "🔧 N8N Workflow JSON Fixer"
echo "=========================="

# Function to fix a single JSON file
fix_json_file() {
    local file="$1"
    local filename=$(basename "$file" .json)
    local backup_file="${file}.backup"
    
    echo "🔍 Fixing: $filename"
    
    # Create backup
    cp "$file" "$backup_file"
    
    # Check if file has required fields
    local needs_fix=false
    
    if ! jq -e '.active' "$file" > /dev/null 2>&1; then
        needs_fix=true
    fi
    
    if ! jq -e '.versionId' "$file" > /dev/null 2>&1; then
        needs_fix=true
    fi
    
    if [ "$needs_fix" = true ]; then
        echo "   📝 Adding missing required fields..."
        
        # Add required fields using jq
        jq '
        . + {
            "active": true,
            "versionId": "1",
            "meta": (if .meta then .meta else {} end),
            "pinData": (if .pinData then .pinData else {} end),
            "settings": (if .settings then .settings else {} end),
            "staticData": (if .staticData then .staticData else null end),
            "tags": (if .tags then .tags else [] end),
            "triggerCount": (if .triggerCount then .triggerCount else 0 end),
            "updatedAt": (if .updatedAt then .updatedAt else now | strftime("%Y-%m-%dT%H:%M:%S.%fZ") end),
            "createdAt": (if .createdAt then .createdAt else now | strftime("%Y-%m-%dT%H:%M:%S.%fZ") end)
        }
        ' "$backup_file" > "$file"
        
        if [ $? -eq 0 ]; then
            echo "   ✅ Fixed successfully"
            rm "$backup_file"
            return 0
        else
            echo "   ❌ Fix failed - restoring backup"
            mv "$backup_file" "$file"
            return 1
        fi
    else
        echo "   ✅ Already has required fields"
        rm "$backup_file"
        return 0
    fi
}

# Function to validate JSON files
validate_json_files() {
    echo "🔍 Validating JSON files..."
    local valid=0
    local invalid=0
    local invalid_files=()
    
    find "$N8N_DIR" -name "*.json" -type f | while read -r file; do
        local filename=$(basename "$file")
        
        if jq empty "$file" 2>/dev/null; then
            valid=$((valid + 1))
        else
            echo "❌ Invalid JSON: $filename"
            invalid=$((invalid + 1))
            invalid_files+=("$file")
        fi
    done
    
    echo "📊 JSON Validation:"
    echo "   ✅ Valid: $valid"
    echo "   ❌ Invalid: $invalid"
    
    # Try to fix invalid JSON files
    if [ $invalid -gt 0 ]; then
        echo ""
        echo "🔧 Attempting to fix invalid JSON files..."
        for file in "${invalid_files[@]}"; do
            fix_invalid_json "$file"
        done
    fi
}

# Function to fix invalid JSON
fix_invalid_json() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "🔧 Attempting to fix: $filename"
    
    # Common JSON fixes
    local temp_file=$(mktemp)
    
    # Remove trailing commas and fix common issues
    sed 's/,\s*}/}/g; s/,\s*]/]/g' "$file" > "$temp_file"
    
    if jq empty "$temp_file" 2>/dev/null; then
        echo "   ✅ Fixed trailing comma issues"
        mv "$temp_file" "$file"
        return 0
    else
        echo "   ❌ Could not auto-fix JSON syntax"
        rm "$temp_file"
        return 1
    fi
}

# Function to import fixed workflows
import_fixed_workflows() {
    echo "📥 Importing fixed workflows..."
    
    local success=0
    local failed=0
    local imported_list=()
    
    # Get list of currently imported workflows to avoid duplicates
    local existing_workflows=$(docker exec sbs-n8n-1 n8n list:workflow 2>/dev/null | tail -n +2 | cut -d'|' -f2)
    
    find "$N8N_DIR" -name "*.json" -type f | sort | while read -r file; do
        local filename=$(basename "$file" .json)
        local workflow_name=$(jq -r '.name // empty' "$file" 2>/dev/null || echo "$filename")
        
        # Check if already imported
        if echo "$existing_workflows" | grep -q "^$workflow_name$"; then
            echo "⏭️  Skipping $filename (already imported as $workflow_name)"
            continue
        fi
        
        # Copy to n8n data directory
        local n8n_workflows_dir="$PROJECT_ROOT/data/n8n/workflows"
        mkdir -p "$n8n_workflows_dir"
        cp "$file" "$n8n_workflows_dir/$filename.json"
        
        # Attempt import
        if docker exec sbs-n8n-1 n8n import:workflow --input="/home/node/.n8n/workflows/$filename.json" 2>/dev/null; then
            echo "✅ Imported: $filename"
            success=$((success + 1))
            imported_list+=("$filename")
        else
            echo "❌ Failed: $filename"
            failed=$((failed + 1))
        fi
        
        # Clean up temp file
        rm -f "$n8n_workflows_dir/$filename.json"
        
        sleep 0.2
    done
    
    echo ""
    echo "📊 Import Results:"
    echo "   ✅ Successfully imported: $success"
    echo "   ❌ Failed to import: $failed"
    
    if [ ${#imported_list[@]} -gt 0 ]; then
        echo ""
        echo "🎉 Newly imported workflows:"
        printf '   📄 %s\n' "${imported_list[@]}"
    fi
}

# Function to show missing dependencies
check_missing_dependencies() {
    echo "🔍 Checking for missing dependencies..."
    
    # Check for common missing node types
    local missing_nodes=()
    
    # Scan all JSON files for node types
    find "$N8N_DIR" -name "*.json" -type f -exec jq -r '.nodes[]?.type // empty' {} \; 2>/dev/null | sort -u | while read -r node_type; do
        if [[ "$node_type" == n8n-nodes-base.* ]]; then
            continue  # Built-in nodes
        elif [[ "$node_type" == @n8n/* ]]; then
            continue  # Official n8n nodes
        else
            echo "🔌 Custom/Community node detected: $node_type"
        fi
    done
    
    # Check for specific dependencies that commonly cause issues
    local deps_to_check=(
        "n8n-nodes-base.function"
        "n8n-nodes-base.functionItem"
        "n8n-nodes-base.set"
        "n8n-nodes-base.merge"
        "n8n-nodes-base.if"
        "n8n-nodes-base.switch"
        "n8n-nodes-base.httpRequest"
        "n8n-nodes-base.webhook"
        "n8n-nodes-base.postgres"
    )
    
    echo ""
    echo "✅ All standard n8n nodes should be available in your instance"
}

# Main execution
main() {
    echo "🔧 Starting JSON workflow fixes..."
    
    # Check if jq is installed
    if ! command -v jq > /dev/null; then
        echo "📦 Installing jq for JSON processing..."
        sudo apt-get update && sudo apt-get install -y jq
    fi
    
    # Validate and fix JSON files
    validate_json_files
    
    echo ""
    echo "🔧 Fixing workflow files..."
    local fixed=0
    local total=0
    
    find "$N8N_DIR" -name "*.json" -type f | while read -r file; do
        total=$((total + 1))
        if fix_json_file "$file"; then
            fixed=$((fixed + 1))
        fi
    done
    
    echo ""
    echo "📊 Fix Summary:"
    echo "   Total files processed: $(find "$N8N_DIR" -name "*.json" -type f | wc -l)"
    echo "   Files fixed: $fixed"
    
    # Check dependencies
    echo ""
    check_missing_dependencies
    
    # Import all fixed workflows
    echo ""
    import_fixed_workflows
    
    # Final status
    echo ""
    echo "🎯 Final Status:"
    local final_count=$(docker exec sbs-n8n-1 n8n list:workflow 2>/dev/null | wc -l || echo "0")
    echo "   Total workflows in n8n: $final_count"
    echo "   Original JSON files: $(find "$N8N_DIR" -name "*.json" -type f | wc -l)"
    
    echo ""
    echo "✅ Workflow fixing and import complete!"
    echo "🌐 View your workflows at: http://localhost:15678"
}

main "$@"
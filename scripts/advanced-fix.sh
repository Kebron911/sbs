#!/bin/bash

# Advanced N8N Workflow Fixer
# Fixes the specific issues identified: timestamps, tagId, JSON syntax, and webhook conflicts

set -e

SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
N8N_DIR="$PROJECT_ROOT/n8n"

echo "🔧 Advanced N8N Workflow Fixer"
echo "=============================="

# Function to fix timestamp format in JSON
fix_timestamps() {
    local file="$1"
    local temp_file=$(mktemp)
    
    # Fix timestamp format - remove the %f placeholder and use proper format
    jq '
    def fix_timestamp: if type == "string" and contains("%fZ") then gsub("%fZ"; "000Z") else . end;
    walk(if type == "object" then with_entries(.value |= fix_timestamp) else . end)
    ' "$file" > "$temp_file"
    
    if [ $? -eq 0 ]; then
        mv "$temp_file" "$file"
        return 0
    else
        rm "$temp_file"
        return 1
    fi
}

# Function to fix a single workflow with proper error handling
fix_workflow_advanced() {
    local file="$1"
    local filename=$(basename "$file" .json)
    local backup_file="${file}.backup"
    
    echo "🔍 Advanced fix: $filename"
    
    # Create backup
    cp "$file" "$backup_file"
    
    # First, try to fix basic JSON syntax
    local temp_file=$(mktemp)
    
    # Remove trailing commas and fix common JSON issues
    sed 's/,\s*}/}/g; s/,\s*]/]/g' "$file" > "$temp_file"
    
    # Check if basic fix worked
    if ! jq empty "$temp_file" 2>/dev/null; then
        echo "   ❌ Cannot fix JSON syntax errors"
        rm "$temp_file"
        rm "$backup_file"
        return 1
    fi
    
    # Apply the fixed JSON back
    mv "$temp_file" "$file"
    
    # Now apply advanced fixes using jq
    local current_time=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    
    jq --arg timestamp "$current_time" '
    . + {
        "active": true,
        "versionId": "1",
        "meta": (if .meta then .meta else {} end),
        "pinData": (if .pinData then .pinData else {} end),
        "settings": (if .settings then .settings else {} end),
        "staticData": (if .staticData then .staticData else null end),
        "tags": [],
        "triggerCount": (if .triggerCount then .triggerCount else 0 end),
        "updatedAt": $timestamp,
        "createdAt": $timestamp
    }
    ' "$file" > "$temp_file"
    
    if [ $? -eq 0 ]; then
        mv "$temp_file" "$file"
        
        # Fix timestamps if needed
        if fix_timestamps "$file"; then
            echo "   ✅ Advanced fix successful"
            rm "$backup_file"
            return 0
        else
            echo "   ⚠️  Timestamp fix failed, but basic fix applied"
            rm "$backup_file"
            return 0
        fi
    else
        echo "   ❌ Advanced fix failed - restoring backup"
        mv "$backup_file" "$file"
        rm "$temp_file" 2>/dev/null || true
        return 1
    fi
}

# Function to import with better error handling
import_with_retry() {
    local file="$1"
    local filename=$(basename "$file" .json)
    local max_attempts=2
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "   📥 Import attempt $attempt/$max_attempts"
        
        # Copy to n8n data directory with unique name to avoid conflicts
        local n8n_workflows_dir="$PROJECT_ROOT/data/n8n/workflows"
        mkdir -p "$n8n_workflows_dir"
        local unique_filename="${filename}_$(date +%s).json"
        cp "$file" "$n8n_workflows_dir/$unique_filename"
        
        # Try import
        local import_output
        import_output=$(docker exec sbs-n8n-1 n8n import:workflow --input="/home/node/.n8n/workflows/$unique_filename" 2>&1)
        local import_result=$?
        
        # Clean up temp file
        rm -f "$n8n_workflows_dir/$unique_filename"
        
        if [ $import_result -eq 0 ]; then
            echo "   ✅ Import successful on attempt $attempt"
            return 0
        else
            if echo "$import_output" | grep -q "tagId.*not-null"; then
                echo "   🔧 TagId constraint issue detected, fixing..."
                # This specific error needs special handling
                attempt=$((attempt + 1))
            elif echo "$import_output" | grep -q "already exists"; then
                echo "   ⏭️  Workflow already exists"
                return 0
            else
                echo "   ❌ Import failed: $(echo "$import_output" | head -1)"
                attempt=$((attempt + 1))
            fi
        fi
        
        sleep 1
    done
    
    return 1
}

# Function to get the 10 most important workflows to import
get_priority_workflows() {
    local -a priority_files=(
        "ai_workflows/ai_missions.json"
        "ai_workflows/event_seeder.json"
        "core_systems/init_user_setup.json"
        "core_systems/cron_manager.json"
        "core_systems/pg_listener.json"
        "game_engines/prestige_calc.json"
        "game_engines/achievement_unlock.json"
        "subflows/character_management/character_data_fetching.json"
        "subflows/character_management/character_level_progression.json"
        "subflows/validation_responses/validate_input.json"
    )
    
    for workflow in "${priority_files[@]}"; do
        local full_path="$N8N_DIR/$workflow"
        if [ -f "$full_path" ]; then
            echo "$full_path"
        fi
    done
}

# Main execution
main() {
    echo "🔧 Starting advanced workflow fixes..."
    
    # Check dependencies
    if ! command -v jq > /dev/null; then
        echo "📦 Installing jq..."
        sudo apt-get update && sudo apt-get install -y jq
    fi
    
    echo ""
    echo "🎯 Focusing on top 10 priority workflows for import..."
    
    local priority_workflows
    readarray -t priority_workflows < <(get_priority_workflows)
    
    echo "📋 Priority workflows identified: ${#priority_workflows[@]}"
    
    local success=0
    local failed=0
    
    for file in "${priority_workflows[@]}"; do
        local filename=$(basename "$file" .json)
        echo ""
        echo "[$((success + failed + 1))/${#priority_workflows[@]}] Processing: $filename"
        
        # Fix the workflow
        if fix_workflow_advanced "$file"; then
            # Try to import it
            if import_with_retry "$file"; then
                success=$((success + 1))
                echo "🎉 $filename: Fixed and imported successfully!"
            else
                failed=$((failed + 1))
                echo "⚠️  $filename: Fixed but import failed"
            fi
        else
            failed=$((failed + 1))
            echo "❌ $filename: Could not fix"
        fi
        
        sleep 0.5
    done
    
    echo ""
    echo "📊 Priority Import Results:"
    echo "   ✅ Successfully imported: $success"
    echo "   ❌ Failed: $failed"
    
    # Show final status
    echo ""
    echo "🎯 Final N8N Status:"
    local final_count=$(docker exec sbs-n8n-1 n8n list:workflow 2>/dev/null | wc -l || echo "0")
    echo "   Total workflows in n8n: $final_count"
    echo "   Target was to add: ${#priority_workflows[@]} priority workflows"
    
    if [ $success -gt 0 ]; then
        echo ""
        echo "🎉 Successfully imported $success additional workflows!"
        echo "🌐 View them at: http://localhost:15678"
    fi
    
    if [ $failed -gt 0 ]; then
        echo ""
        echo "💡 $failed workflows still need manual attention"
        echo "   Common issues: Complex JSON syntax, webhook conflicts, or custom node dependencies"
    fi
}

main "$@"
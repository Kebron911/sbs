#!/bin/bash
# verify-organization.sh - Verify file organization and references

echo "🔍 Verifying SBS File Organization"
echo "================================="

# Check essential root files
echo "📁 Checking essential root files..."
ESSENTIAL_FILES=("README.md" "docker-compose.yml" ".env.example" ".gitignore")
for file in "${ESSENTIAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING"
    fi
done

# Check folder structure
echo ""
echo "📁 Checking folder structure..."
REQUIRED_FOLDERS=("docs" "scripts" "data" "n8n" "maintenance" "database")
for folder in "${REQUIRED_FOLDERS[@]}"; do
    if [ -d "$folder" ]; then
        echo "  ✅ $folder/"
    else
        echo "  ❌ $folder/ - MISSING"
    fi
done

# Check moved files are in correct locations
echo ""
echo "📄 Checking moved files..."
MOVED_FILES=(
    "docs/DEPLOYMENT.md"
    "docs/PORTABILITY.md" 
    "docs/PORTS.md"
    "scripts/deploy.sh"
    "scripts/setup-permissions.sh"
)
for file in "${MOVED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file - MISSING"
    fi
done

# Check script executability
echo ""
echo "🔧 Checking script permissions..."
SCRIPTS=("scripts/deploy.sh" "scripts/setup-permissions.sh")
for script in "${SCRIPTS[@]}"; do
    if [ -x "$script" ]; then
        echo "  ✅ $script (executable)"
    else
        echo "  ⚠️  $script (not executable - run: chmod +x $script)"
    fi
done

# Check docker-compose validity
echo ""
echo "🐳 Checking Docker Compose configuration..."
if docker compose config --quiet 2>/dev/null; then
    echo "  ✅ docker-compose.yml (valid configuration)"
else
    echo "  ⚠️  docker-compose.yml (validation warnings - check environment variables)"
fi

echo ""
echo "✅ File organization verification complete!"
echo ""
echo "🚀 To deploy the system:"
echo "   1. cp .env.example .env"
echo "   2. Edit .env with your configuration"
echo "   3. ./scripts/deploy.sh"
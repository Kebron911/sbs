#!/bin/bash
# health_check.sh - Cross-platform wrapper script for SBS health checks
# Works on Linux, macOS, and Windows (with Git Bash/WSL)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored output
print_status() {
    echo -e "${2}${1}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to setup Python environment
setup_python_env() {
    print_status "🐍 Setting up Python environment..." "$BLUE"
    
    # Check if Python is available
    if command_exists python3; then
        PYTHON_CMD="python3"
    elif command_exists python; then
        PYTHON_CMD="python"
    else
        print_status "❌ Error: Python not found. Please install Python 3.7+." "$RED"
        exit 1
    fi
    
    # Check Python version
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | cut -d' ' -f2)
    print_status "✅ Found Python $PYTHON_VERSION" "$GREEN"
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        print_status "📦 Creating virtual environment..." "$BLUE"
        $PYTHON_CMD -m venv venv
    fi
    
    # Activate virtual environment
    if [ -f "venv/bin/activate" ]; then
        source venv/bin/activate
    elif [ -f "venv/Scripts/activate" ]; then
        source venv/Scripts/activate
    else
        print_status "⚠️  Warning: Could not find virtual environment activation script" "$YELLOW"
    fi
    
    # Install requirements
    if [ -f "requirements.txt" ]; then
        print_status "📥 Installing dependencies..." "$BLUE"
        pip install -r requirements.txt --quiet
    fi
}

# Function to run health checks
run_health_check() {
    print_status "🔍 Running SBS n8n Ecosystem Health Check..." "$BLUE"
    $PYTHON_CMD health_check.py "$@"
}

# Function to show usage
show_usage() {
    echo "SBS n8n Ecosystem Health Check Wrapper"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --quick         Run basic checks only"
    echo "  --full          Run comprehensive checks (default)"
    echo "  --docker-only   Check Docker services only"
    echo "  --api-only      Check APIs and webhooks only"
    echo "  --export-json   Export results to JSON file"
    echo "  --silent        Suppress console output"
    echo "  --config FILE   Use custom config file"
    echo "  --setup-only    Only setup environment, don't run checks"
    echo "  --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Run all checks"
    echo "  $0 --quick            # Run basic checks only"
    echo "  $0 --docker-only      # Check Docker services only"
    echo "  $0 --export-json      # Export results to JSON"
    echo ""
}

# Main execution
main() {
    cd "$SCRIPT_DIR"
    
    # Parse arguments
    SETUP_ONLY=false
    ARGS=()
    
    for arg in "$@"; do
        case $arg in
            --help|-h)
                show_usage
                exit 0
                ;;
            --setup-only)
                SETUP_ONLY=true
                ;;
            *)
                ARGS+=("$arg")
                ;;
        esac
    done
    
    # Setup Python environment
    setup_python_env
    
    if [ "$SETUP_ONLY" = true ]; then
        print_status "✅ Environment setup complete. Use '$0' to run health checks." "$GREEN"
        exit 0
    fi
    
    # Run health checks
    run_health_check "${ARGS[@]}"
}

# Run main function with all arguments
main "$@"
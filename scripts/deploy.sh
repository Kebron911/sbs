#!/bin/bash
# deploy.sh - Complete SBS deployment script

set -e  # Exit on any error

# Change to project root directory (parent of scripts/)
cd "$(dirname "$0")/.."

echo "🚀 SBS n8n Ecosystem Deployment Script"
echo "======================================="
echo "Working directory: $(pwd)"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available (v2 syntax)
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "📝 Creating .env file from .env.example..."
        cp .env.example .env
        echo "⚠️  IMPORTANT: Edit .env file with your specific values before continuing!"
        echo "   Required changes:"
        echo "   - DB_PASSWORD"
        echo "   - N8N_ENCRYPTION_KEY"
        echo "   - N8N_USER_MANAGEMENT_JWT_SECRET"
        echo "   - N8N_WEBHOOK_BASE_URL"
        echo "   - API keys (OpenAI, Telegram, etc.)"
        echo ""
        read -p "Press Enter after you've edited the .env file..."
    else
        echo "❌ No .env.example file found. Cannot create .env file."
        echo "   Looking for .env.example in: $(pwd)"
        exit 1
    fi
fi

# Create data directories
echo "📁 Creating data directories..."
mkdir -p data/postgres data/n8n data/redis logs/pg-listener backups/n8n

# Set permissions
echo "🔧 Setting up permissions..."
./scripts/setup-permissions.sh

# Pull latest images
echo "📥 Pulling Docker images..."
docker compose pull

# Build custom images
echo "🔨 Building custom images..."
docker compose build

# Start services
echo "🚀 Starting SBS services..."
docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🏥 Checking service health..."
docker compose ps

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Services available at:"
echo "   - n8n: http://localhost:15678"
echo "   - Adminer: http://localhost:18080"
echo "   - PostgreSQL: localhost:15432"
echo "   - Redis: localhost:16379"
echo "   - Postgres Exporter: http://localhost:19187"
echo ""
echo "📊 Monitor logs with:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop services with:"
echo "   docker compose down"
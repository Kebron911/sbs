#!/bin/bash
# setup-permissions.sh - Set proper permissions for data folders

echo "🔧 Setting up permissions for SBS data folders..."

# Create data folders if they don't exist
mkdir -p data/postgres data/n8n data/redis logs/pg-listener backups/n8n

# PostgreSQL requires specific ownership
echo "📁 Setting PostgreSQL data folder permissions..."
sudo chown -R 999:999 data/postgres
chmod -R 755 data/postgres

# n8n data folder
echo "📁 Setting n8n data folder permissions..."
chown -R 1000:1000 data/n8n
chmod -R 755 data/n8n

# Redis data folder
echo "📁 Setting Redis data folder permissions..."
chown -R 999:999 data/redis
chmod -R 755 data/redis

# Logs folder
echo "📁 Setting logs folder permissions..."
chmod -R 755 logs
chown -R 1000:1000 logs

# Backups folder
echo "📁 Setting backups folder permissions..."
chmod -R 755 backups
chown -R 1000:1000 backups

echo "✅ Permissions setup complete!"
echo ""
echo "💡 If you get permission errors, run this script with sudo:"
echo "   sudo ./setup-permissions.sh"
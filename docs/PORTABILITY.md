# 📦 SBS Portability Guide

## Overview

The SBS system is now fully portable! All data is stored in local folders instead of Docker volumes, making it easy to copy the entire system to another computer.

## 🎯 What Makes It Portable

- **Local Data Storage**: All database, n8n, and Redis data is stored in `./data/` folders
- **Local Logs**: Application logs are stored in `./logs/` folders
- **Local Backups**: Backup files are stored in `./backups/` folders
- **No External Dependencies**: Everything needed is contained within the project folder

## 📂 Complete Folder Structure

```
sbs/
├── .env.example                 # Environment template
├── .gitignore                  # Git ignore rules
├── DEPLOYMENT.md               # Deployment documentation
├── docker-compose.yml          # Docker services configuration
├── deploy.sh                   # Automated deployment script
├── setup-permissions.sh        # Permission setup script
├── PORTABILITY.md             # This file
├── backups/                   # Backup files
│   ├── README.md
│   └── n8n/                   # n8n workflow backups
├── certs/                     # SSL certificates
│   ├── README.md
│   └── .gitkeep              # Preserves directory structure
├── data/                      # Persistent data (excluded from git)
│   ├── README.md
│   ├── postgres/              # PostgreSQL database files
│   ├── n8n/                   # n8n workflow and config data
│   └── redis/                 # Redis cache data
├── database/                  # Database schema and scripts
│   ├── README.md
│   └── schema.sql             # PostgreSQL schema
├── install/                   # Installation dependencies
│   ├── README.md
│   └── requirements.txt       # Python dependencies
├── logs/                      # Application logs (excluded from git)
│   ├── README.md
│   └── pg-listener/           # PostgreSQL listener logs
├── maintenance/               # Health check and maintenance scripts
│   ├── README.md
│   ├── health_check.py
│   ├── health_check.sh
│   ├── health_check.bat
│   └── HEALTH_CHECK.md
├── n8n/                       # n8n workflows and configurations
│   ├── README.md
│   ├── subflows/              # Reusable subflow components
│   ├── administration/        # Admin workflows
│   ├── ai_workflows/          # AI-related workflows
│   ├── core_systems/          # Core system workflows
│   ├── game_engines/          # Game mechanic workflows
│   ├── testing_development/   # Testing workflows
│   └── user_interfaces/       # User interface workflows
├── pg-listener/               # PostgreSQL listener service
│   ├── README.md
│   ├── Dockerfile
│   ├── listener.js
│   └── package.json
└── references/                # Documentation and reference materials
    └── [various documentation files]
```

## 🚀 How to Move to Another Computer

### Option 1: Full System Copy (Recommended)

1. **Stop Services** (on source computer):
   ```bash
   cd /path/to/sbs
   docker-compose down
   ```

2. **Copy Entire Folder**:
   ```bash
   # Compress the entire folder
   tar -czf sbs-backup.tar.gz sbs/
   
   # Or use rsync for network transfer
   rsync -av sbs/ user@newcomputer:/path/to/sbs/
   ```

3. **Setup on New Computer**:
   ```bash
   # Extract if using tar
   tar -xzf sbs-backup.tar.gz
   
   # Navigate to folder
   cd sbs/
   
   # Run deployment script
   ./scripts/deploy.sh
   ```

### Option 2: Git + Data Sync

1. **Commit Code Changes** (if any):
   ```bash
   git add .
   git commit -m "Update configurations"
   git push
   ```

2. **Backup Data Separately**:
   ```bash
   tar -czf sbs-data-backup.tar.gz data/ logs/ backups/
   ```

3. **Setup on New Computer**:
   ```bash
   # Clone repository
   git clone <your-repo-url> sbs
   cd sbs/
   
   # Extract data backup
   tar -xzf sbs-data-backup.tar.gz
   
   # Deploy
   ./scripts/deploy.sh
   ```

## ⚙️ First-Time Setup on New Computer

1. **Install Prerequisites**:
   - Docker
   - Docker Compose

2. **Run Deployment**:
   ```bash
   ./scripts/deploy.sh
   ```

3. **Verify Services**:
   ```bash
   docker-compose ps
   ./maintenance/health_check.sh
   ```

## 🔒 Important Files to Configure

Before starting on a new computer, ensure these files are properly configured:

### `.env` File
Copy from `.env.example` and update:
- `DB_PASSWORD` - Database password
- `N8N_ENCRYPTION_KEY` - 32-character encryption key
- `N8N_USER_MANAGEMENT_JWT_SECRET` - JWT secret
- `N8N_WEBHOOK_BASE_URL` - Your domain/IP (use port 15678)
- API keys (OpenAI, Telegram, etc.)

### SSL Certificates (Optional)
Place SSL certificates in the `certs/` directory:
- `gehealthcare-ca-bundle.pem` - CA certificate bundle
- Other certificates as needed

### Service Ports (Updated to Avoid Conflicts)
- **n8n**: `15678` (instead of 5678)
- **PostgreSQL**: `15432` (instead of 5432)
- **Adminer**: `18080` (instead of 8080)
- **Redis**: `16379` (instead of 6379)
- **Postgres Exporter**: `19187` (instead of 9187)

## 🛡️ Security Considerations

- **Change Default Passwords**: Always update passwords in `.env`
- **Secure API Keys**: Never commit real API keys to version control
- **File Permissions**: The `setup-permissions.sh` script handles proper permissions
- **Firewall**: Configure firewall rules for exposed ports (5678, 8080, etc.)

## 🔄 Data Persistence

All important data is now stored locally:

- **PostgreSQL Data**: `./data/postgres/`
- **n8n Workflows**: `./data/n8n/`
- **Redis Cache**: `./data/redis/`
- **Application Logs**: `./logs/`
- **Backups**: `./backups/`

## 🧪 Testing Portability

To test portability:

1. Stop services: `docker-compose down`
2. Copy folder to different location
3. Start services: `./deploy.sh`
4. Verify all data is preserved

## 📞 Troubleshooting

### Permission Issues
```bash
sudo ./scripts/setup-permissions.sh
```

### Port Conflicts
Edit `docker-compose.yml` to change port mappings.

### Data Recovery
All data is in local folders - no special recovery needed, just copy the folders.

---

## ✅ Benefits of This Setup

- **🚀 Fully Portable**: Copy folder = copy entire system
- **💾 No Data Loss**: All data stored locally
- **🔧 Easy Backup**: Just copy the folder
- **🏃 Quick Deploy**: One script deployment
- **🔄 Version Control**: Structure preserved in git
- **🛡️ Self-Contained**: No external dependencies
# 🚀 SBS (Systematic Building System) - n8n Ecosystem

A comprehensive, production-ready n8n ecosystem for building gamified productivity systems with AI integration.

## 🎯 Quick Start

1. **Clone/Copy** this repository to your target machine
2. **Configure** environment: `cp .env.example .env` and edit with your values
3. **Deploy** the system: `./scripts/deploy.sh`
4. **Access** n8n at: http://localhost:15678

## 📁 Project Structure

```
sbs/
├── 📄 README.md                   # This file - project overview
├── 📄 docker-compose.yml          # Main deployment configuration
├── 📄 .env.example               # Environment template
├── 📄 .gitignore                 # Git ignore rules
├── 📁 docs/                      # Documentation
│   ├── DEPLOYMENT.md             # Deployment guide
│   ├── PORTABILITY.md            # How to move between computers
│   └── PORTS.md                  # Port configuration reference
├── 📁 scripts/                   # Utility scripts
│   ├── deploy.sh                 # Automated deployment
│   └── setup-permissions.sh      # Permission setup
├── 📁 data/                      # Persistent data (local storage)
│   ├── postgres/                 # PostgreSQL database files
│   ├── n8n/                      # n8n workflow data
│   └── redis/                    # Redis cache data
├── 📁 database/                  # Database schema and scripts
├── 📁 n8n/                       # n8n workflows and subflows
├── 📁 maintenance/               # Health check and maintenance tools
├── 📁 certs/                     # SSL certificates
├── 📁 logs/                      # Application logs
├── 📁 backups/                   # Backup files
└── 📁 references/                # Documentation and specs
```

## 🔌 Service Ports

- **n8n**: http://localhost:15678
- **PostgreSQL**: localhost:15432
- **Adminer**: http://localhost:18080
- **Redis**: localhost:16379

*Custom ports avoid conflicts with existing services*

## ✨ Key Features

- **🎮 Gamified System**: Complete RPG-style progression system
- **🤖 AI Integration**: OpenAI/Claude API integration with intelligent workflows
- **📊 Enterprise Architecture**: 33+ reusable subflows, professional logging
- **🔄 Fully Portable**: Local folder storage, copy-and-deploy anywhere
- **🛡️ Production Ready**: Health checks, monitoring, backup systems
- **📱 Telegram Integration**: Bot interface for mobile interaction

## 🏗️ System Components

### Core Services
- **n8n**: Workflow automation platform with community packages enabled
- **PostgreSQL**: Primary database with performance tuning
- **Redis**: Caching and session management
- **Adminer**: Database management interface
- **pg-listener**: Real-time database event processing

### Application Architecture
- **33+ Subflows**: Reusable workflow components organized by function
- **Game Engines**: Achievement, progression, and reward systems
- **AI Workflows**: Intelligent content generation and processing
- **User Interfaces**: Telegram bot and manual task management
- **Administration**: System monitoring and management tools

## 📚 Documentation

- [**Deployment Guide**](docs/DEPLOYMENT.md) - Complete setup instructions
- [**Portability Guide**](docs/PORTABILITY.md) - Moving between computers
- [**Port Reference**](docs/PORTS.md) - Service port configuration
- [**n8n Subflows**](n8n/subflows/README.md) - Workflow component reference

## 🚀 Quick Commands

```bash
# Deploy entire system
./scripts/deploy.sh

# Stop all services
docker compose down

# View service status
docker compose ps

# Monitor logs
docker compose logs -f

# Run health checks
./maintenance/health_check.sh

# Backup system (copy entire folder)
cp -r sbs/ backup-$(date +%Y%m%d)/
```

## 🔧 Configuration

1. **Environment Setup**: Copy `.env.example` to `.env` and configure:
   - Database passwords
   - n8n encryption keys
   - API keys (OpenAI, Telegram)
   - Webhook URLs

2. **SSL Certificates** (optional): Place certificates in `certs/` folder

3. **Port Configuration**: Modify `docker-compose.yml` if different ports needed

## 🎯 Use Cases

- **Personal Productivity**: Gamified task and habit management
- **Team Collaboration**: Shared progression and achievement systems
- **Content Creation**: AI-assisted content generation workflows
- **Data Processing**: Automated data collection and analysis
- **System Integration**: Connect various APIs and services

## 📊 System Stats

- **33 Subflows** across 9 functional categories
- **Production-ready** with comprehensive error handling
- **Enterprise architecture** with centralized logging
- **70% code reduction** through reusable components
- **Fully portable** - works on any Docker-capable system

## 🤝 Support

- Check [troubleshooting](docs/DEPLOYMENT.md#troubleshooting) for common issues
- Review [health check tools](maintenance/README.md) for system diagnostics
- Examine logs: `docker compose logs -f [service-name]`

---

**Built for productivity, designed for portability, optimized for scale.**
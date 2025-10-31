# 📚 Documentation

This directory contains all project documentation for the SBS n8n ecosystem.

## 📄 Files

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete deployment and setup guide
  - Environment configuration
  - Docker deployment steps
  - Service access and verification
  - Troubleshooting common issues

- **[PORTABILITY.md](PORTABILITY.md)** - System portability and migration guide
  - How to move the system between computers
  - Backup and restore procedures
  - Complete folder structure reference
  - Security considerations

- **[PORTS.md](PORTS.md)** - Service port configuration reference
  - All service ports and URLs
  - Port conflict avoidance strategy
  - Internal vs external port mapping
  - Configuration change procedures

## 🔗 Additional Documentation

- [Main README](../README.md) - Project overview and quick start
- [n8n Subflows](../n8n/subflows/README.md) - Workflow components documentation
- [Maintenance Tools](../maintenance/README.md) - Health check and monitoring tools
- [Database Schema](../database/README.md) - Database structure and setup

## 📋 Quick Reference

### Essential Commands
```bash
# Deploy system
./scripts/deploy.sh

# View documentation
cat docs/DEPLOYMENT.md
cat docs/PORTABILITY.md
cat docs/PORTS.md
```

### Service URLs
- n8n: http://localhost:15678
- Adminer: http://localhost:18080
- PostgreSQL: localhost:15432
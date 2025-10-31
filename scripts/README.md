# 🔧 Scripts

This directory contains utility scripts for deploying and managing the SBS system.

## 📄 Scripts

### **[deploy.sh](deploy.sh)** - Automated Deployment Script
Complete deployment automation with error handling and validation.

**Features:**
- Docker and Docker Compose validation
- Environment file setup assistance
- Permission configuration
- Image pulling and building
- Service startup and health checking
- Comprehensive status reporting

**Usage:**
```bash
./scripts/deploy.sh
```

**Requirements:**
- Docker and Docker Compose installed
- Configured `.env` file
- Appropriate file permissions

---

### **[setup-permissions.sh](setup-permissions.sh)** - Permission Setup Script
Sets proper file and folder permissions for all data directories.

**Features:**
- PostgreSQL data folder permissions (999:999)
- n8n data folder permissions (1000:1000)
- Redis data folder permissions (999:999)
- Logs and backups folder permissions
- Cross-platform compatibility

**Usage:**
```bash
./scripts/setup-permissions.sh

# Or with sudo if needed:
sudo ./scripts/setup-permissions.sh
```

---

### **[verify-organization.sh](verify-organization.sh)** - Organization Verification Script
Verifies that all files are properly organized and the system is ready for deployment.

**Features:**
- Checks essential root files are present
- Verifies folder structure integrity
- Confirms moved files are in correct locations
- Validates script permissions
- Tests Docker Compose configuration

**Usage:**
```bash
./scripts/verify-organization.sh
```

## 🚀 Quick Start Workflow

1. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Deploy System**:
   ```bash
   ./scripts/deploy.sh
   ```

3. **Verify Deployment**:
   ```bash
   docker compose ps
   ./maintenance/health_check.sh
   ```

## 🔧 Script Development

When adding new scripts:
1. Make them executable: `chmod +x script-name.sh`
2. Add proper error handling with `set -e`
3. Include usage documentation
4. Update this README

## 📋 Troubleshooting

### Permission Issues
```bash
sudo ./scripts/setup-permissions.sh
```

### Docker Issues
```bash
# Check Docker status
docker version
docker compose version

# View service logs
docker compose logs -f
```

### Script Execution Issues
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Check script syntax
bash -n scripts/deploy.sh
```
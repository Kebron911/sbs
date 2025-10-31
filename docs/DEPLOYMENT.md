# SBS n8n Ecosystem Deployment Guide

## 🚀 Quick Start Deployment

### Prerequisites
- Docker & Docker Compose installed
- At least 4GB RAM available
- PostgreSQL port 5432 available (or modify in docker-compose.yml)

### 1. Environment Setup
```bash
# Copy and customize environment file
cp .env.example .env

# Edit .env file with your specific values
# CRITICAL: Change all passwords and API keys!
```

### 2. Required Environment Variables to Update
Before starting, you MUST update these values in `.env`:

```bash
# Database Security
DB_PASSWORD=your_secure_password_here_change_this_in_production

# n8n Security (Generate 32-character strings)
N8N_ENCRYPTION_KEY=your-32-character-encryption-key-here-change-this
N8N_USER_MANAGEMENT_JWT_SECRET=your-jwt-secret-here-change-this-in-production

# Your Domain
N8N_WEBHOOK_BASE_URL=https://your-n8n-domain.com
SUBFLOW_BASE_URL=https://your-n8n-domain.com

# API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here
TELEGRAM_BOT_TOKEN=123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
```

### 3. Deploy the Stack

#### Option A: Automated Deployment (Recommended)
```bash
# Run the automated deployment script
./scripts/deploy.sh
```

#### Option B: Manual Deployment
```bash
# Set up permissions for data folders
./scripts/setup-permissions.sh

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f n8n
```

### 4. Initial Setup
1. **Access n8n**: Navigate to `http://localhost:15678`
2. **Create Admin User**: Set up your n8n admin account
3. **Import Workflows**: Import all JSON files from the project
4. **Configure Credentials**: Add your API keys in n8n settings
5. **Test Webhooks**: Verify webhook endpoints are working

## 📊 Service Architecture

### Core Services
- **PostgreSQL**: Primary database with optimized configuration
- **n8n**: Workflow automation engine with 25+ subflows
- **pg-listener**: Database change notification service

### Optional Services (Uncomment in docker-compose.yml)
- **Redis**: Caching layer for improved performance
- **postgres-exporter**: PostgreSQL metrics for monitoring

## 🔍 Health Checks & Monitoring

### Service Health
```bash
# Check all service health
docker-compose ps

# Individual service logs
docker-compose logs postgres
docker-compose logs n8n
docker-compose logs pg-listener

# Database connection test
docker-compose exec postgres psql -U lifeos_app -d lifeos_db -c "SELECT version();"
```

### n8n Workflow Status
- Access: `http://localhost:15678/executions`
- Monitor execution history
- Check for failed workflows
- Review performance metrics

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check database logs
docker-compose logs postgres

# Verify credentials in .env file
# Ensure DB_PASSWORD matches between services
```

#### 2. n8n Won't Start
```bash
# Check n8n logs
docker-compose logs n8n

# Common causes:
# - Invalid N8N_ENCRYPTION_KEY (must be 32 characters)
# - Database not ready (wait 30-60 seconds)
# - Port conflicts (using custom ports: n8n=15678, postgres=15432, etc.)
```

#### 3. Workflows Not Importing
```bash
# Manual import process:
# 1. Access n8n web interface
# 2. Go to Workflows > Import from File
# 3. Import each .json file individually
# 4. Activate imported workflows
```

#### 4. Webhook Issues
```bash
# Verify webhook URL configuration
# Check N8N_WEBHOOK_BASE_URL in .env
# Ensure proper SSL/TLS setup for production
```

### Performance Optimization

#### Database Tuning
```bash
# Monitor database performance
docker-compose exec postgres psql -U lifeos_app -d lifeos_db -c "
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;
"
```

#### n8n Performance
- Enable Redis caching (uncomment in docker-compose.yml)
- Adjust `EXECUTIONS_DATA_MAX_AGE` for execution retention
- Monitor workflow execution times
- Optimize database queries in workflows

## 🔒 Security Hardening

### Production Deployment Security

#### 1. Environment Security
```bash
# Generate secure encryption key (32 characters)
openssl rand -hex 16

# Generate JWT secret
openssl rand -base64 32

# Use strong database password
openssl rand -base64 24
```

#### 2. Network Security
- Use HTTPS only (`N8N_PROTOCOL=https`)
- Configure proper firewall rules
- Limit database access to application only
- Use VPN for administrative access

#### 3. Regular Maintenance
```bash
# Update Docker images
docker-compose pull
docker-compose up -d

# Database backups (automated via cron)
docker-compose exec postgres pg_dump -U lifeos_app lifeos_db > backup_$(date +%Y%m%d).sql

# Monitor logs for security events
docker-compose logs | grep -i "error\|failed\|unauthorized"
```

## 📈 Monitoring & Alerting

### Metrics Collection
```bash
# Enable postgres-exporter in docker-compose.yml
# Access metrics at: http://localhost:9187/metrics

# Key metrics to monitor:
# - Database connections
# - Query execution time
# - Workflow success/failure rates
# - System resource usage
```

### Log Management
```bash
# Centralized logging
docker-compose logs -f --tail=100

# Error monitoring
docker-compose logs | grep ERROR

# Performance monitoring
docker-compose logs n8n | grep "Execution"
```

## 🔄 Backup & Recovery

### Automated Backups
```bash
# Database backup script (add to cron)
#!/bin/bash
BACKUP_DIR="/backup/postgres"
mkdir -p $BACKUP_DIR
docker-compose exec -T postgres pg_dump -U lifeos_app lifeos_db > $BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql

# n8n workflow backup
WORKFLOW_BACKUP_DIR="/backup/n8n"
mkdir -p $WORKFLOW_BACKUP_DIR
# Export workflows through n8n API or web interface
```

### Recovery Procedures
```bash
# Database restore
docker-compose exec -T postgres psql -U lifeos_app -d lifeos_db < backup_file.sql

# Workflow restore
# Import workflows through n8n web interface
# Or use n8n CLI tools
```

## 📚 Additional Resources

### Documentation
- [n8n Documentation](https://docs.n8n.io/)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)
- [Docker Compose Reference](https://docs.docker.com/compose/)

### Support
- Check logs first: `docker-compose logs [service_name]`
- Verify environment variables in `.env`
- Test database connectivity
- Review n8n workflow configurations
- Monitor resource usage

### Development
- Use `DEBUG_MODE=true` for development
- Enable verbose logging for troubleshooting
- Test webhooks with tools like ngrok for local development

---

## 🎯 Success Checklist

- [ ] Environment file configured (.env)
- [ ] All services started successfully
- [ ] Database schema created (automatic)
- [ ] n8n admin user created
- [ ] Workflows imported and activated
- [ ] API credentials configured
- [ ] Webhooks tested and working
- [ ] Health checks passing
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Security settings reviewed

**Your SBS n8n ecosystem is now ready for production use!** 🚀
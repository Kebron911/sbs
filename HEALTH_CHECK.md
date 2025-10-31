# SBS n8n Ecosystem Health Check Tool

## 🎯 Overview

A comprehensive cross-platform Python health monitoring tool for the SBS n8n ecosystem. This tool provides real-time status checking for all components including Docker services, database connectivity, n8n API endpoints, external integrations, and system resources.

## 🚀 Features

### Comprehensive Monitoring
- **🐳 Docker Services**: Monitor all containers (postgres, n8n, pg-listener)
- **🗄️ Database Health**: PostgreSQL connectivity, schema validation, performance metrics
- **⚡ n8n API**: Health endpoints, webhook testing, workflow status
- **🌐 External APIs**: OpenAI, Telegram Bot API validation
- **📡 pg-listener**: Event notification system monitoring
- **💻 System Resources**: CPU, memory, disk usage monitoring

### Cross-Platform Support
- **Windows**: Native batch script wrapper
- **Linux/macOS**: Bash script wrapper
- **Python**: Direct execution on any platform

### Flexible Execution Modes
- **Quick Check**: Basic connectivity tests
- **Full Check**: Comprehensive system analysis
- **Targeted Checks**: Docker-only, API-only, etc.
- **Silent Mode**: Script-friendly output
- **JSON Export**: Machine-readable results

## 📦 Installation

### Prerequisites
- Python 3.7+
- pip package manager

### Quick Setup

#### Windows:
```batch
# Run the Windows setup
health_check.bat --setup-only

# Then run health checks
health_check.bat
```

#### Linux/macOS:
```bash
# Make script executable
chmod +x health_check.sh

# Run setup
./health_check.sh --setup-only

# Then run health checks
./health_check.sh
```

#### Direct Python:
```bash
# Install dependencies
pip install -r requirements.txt

# Run health checks
python health_check.py
```

### Manual Installation
```bash
# Clone or download the health check files
# Install required Python packages
pip install requests psycopg2-binary python-dotenv colorama docker psutil

# Copy your .env file to the same directory
cp .env.example .env

# Edit .env with your configuration
# Run the health check
python health_check.py
```

## 🔧 Configuration

### Environment File
The tool reads configuration from your `.env` file:

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=lifeos_db
DB_USER=lifeos_app
DB_PASSWORD=your_secure_password

# n8n Configuration
N8N_WEBHOOK_BASE_URL=https://your-n8n-domain.com

# API Keys
OPENAI_API_KEY=sk-your-openai-api-key
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
```

### Custom Configuration
```python
# Create custom_config.py
from health_check import HealthCheckConfig

config = HealthCheckConfig(
    env_file="custom.env",
    http_timeout=15,
    db_timeout=10,
    required_services=["postgres", "n8n", "pg-listener", "redis"]
)
```

## 📋 Usage Examples

### Basic Usage
```bash
# Run all checks (default)
python health_check.py

# Quick check (basic connectivity only)
python health_check.py --quick

# Export results to JSON
python health_check.py --export-json
```

### Targeted Checks
```bash
# Check Docker services only
python health_check.py --docker-only

# Check APIs and webhooks only
python health_check.py --api-only

# Silent mode (for scripts)
python health_check.py --silent
```

### Platform-Specific Wrappers
```bash
# Windows
health_check.bat --quick
health_check.bat --export-json

# Linux/macOS
./health_check.sh --docker-only
./health_check.sh --full
```

### Custom Configuration
```bash
# Use custom environment file
python health_check.py --config production.env

# Custom timeout
python health_check.py --timeout 20
```

## 📊 Output Format

### Console Output
```
🔍 Starting SBS n8n Ecosystem Health Check
Platform: Windows 10
Python: 3.11.0
Timestamp: 2025-10-29 10:30:00

🐳 Checking Docker services...
⚡ Checking n8n API and webhooks...
🗄️ Checking database connectivity...
🌐 Checking external APIs...
📡 Checking pg-listener integration...
💻 Checking system resources...

============================================================
🎯 SBS n8n Ecosystem Health Check Results
============================================================

📊 Summary:
  ✅ Passed: 12
  ❌ Failed: 0
  ⚠️ Warnings: 2
  ⏭️ Skipped: 1
  📈 Total: 15

✅ docker_postgres: postgres container is running and healthy (45ms)
     container_id: a1b2c3d4e5f6
     image: postgres:15
     status: running
     health: healthy

✅ database: Database healthy - PostgreSQL 15.4 (123ms)
     postgresql_version: 15.4
     connection_time_ms: 123
     database_size: 45 MB
     active_connections: 3

🎉 ECOSYSTEM STATUS: HEALTHY - All systems operational
```

### JSON Export
```json
{
  "timestamp": "2025-10-29T10:30:00.000Z",
  "platform": {
    "system": "Windows",
    "release": "10",
    "python_version": "3.11.0"
  },
  "summary": {
    "total_checks": 15,
    "passed": 12,
    "failed": 0,
    "warnings": 2,
    "skipped": 1
  },
  "results": [
    {
      "name": "docker_postgres",
      "status": "pass",
      "message": "postgres container is running and healthy",
      "details": {
        "container_id": "a1b2c3d4e5f6",
        "image": "postgres:15",
        "status": "running",
        "health": "healthy"
      },
      "duration_ms": 45,
      "timestamp": "2025-10-29T10:30:01.000Z"
    }
  ]
}
```

## 🔍 Check Categories

### Docker Services
- **postgres**: Database container health
- **n8n**: Workflow engine container
- **pg-listener**: Event notification service
- **redis** (optional): Caching service
- **adminer** (optional): Database admin interface

### Database Checks
- **Connectivity**: Connection time and stability
- **Schema Validation**: Required tables existence
- **Performance Metrics**: Database size, connections
- **Triggers**: pg-listener integration triggers

### n8n API Checks
- **Health Endpoint**: `/healthz` availability
- **Webhook Endpoints**: Test webhook accessibility
- **Metrics**: Response times and status codes

### External API Checks
- **OpenAI API**: Model availability and authentication
- **Telegram Bot API**: Bot information and token validity

### System Resource Checks
- **CPU Usage**: Current processor utilization
- **Memory Usage**: RAM consumption and availability
- **Disk Space**: Storage utilization
- **Platform Info**: OS and Python version details

## 🛠️ Troubleshooting

### Common Issues

#### 1. Docker Connection Failed
```bash
# Check Docker daemon
docker ps

# Restart Docker service
sudo systemctl restart docker  # Linux
# Or restart Docker Desktop on Windows/macOS
```

#### 2. Database Connection Failed
```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test manual connection
psql -h localhost -U lifeos_app -d lifeos_db
```

#### 3. Python Dependencies Missing
```bash
# Install all dependencies
pip install -r requirements.txt

# Or install individually
pip install requests psycopg2-binary python-dotenv colorama
```

#### 4. Environment Variables Not Found
```bash
# Check .env file exists
ls -la .env

# Verify environment variables
python -c "import os; print(os.getenv('DB_PASSWORD'))"
```

### Exit Codes
- **0**: All checks passed
- **1**: One or more checks failed
- **130**: Interrupted by user (Ctrl+C)

## 🔧 Development

### Adding Custom Checks
```python
def check_custom_service(self) -> CheckResult:
    """Add your custom check here"""
    try:
        # Your check logic
        response = requests.get("http://your-service/health")
        
        if response.status_code == 200:
            self._add_result("custom_service", "pass", "Service is healthy")
        else:
            self._add_result("custom_service", "fail", f"Service returned {response.status_code}")
            
    except Exception as e:
        self._add_result("custom_service", "fail", f"Service check failed: {e}")
```

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest test_health_check.py

# Run with coverage
pytest --cov=health_check test_health_check.py
```

## 📈 Monitoring Integration

### Continuous Monitoring
```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/sbs && python health_check.py --silent --export-json

# Send alerts on failures
python health_check.py --silent || echo "SBS Health Check Failed" | mail -s "Alert" admin@domain.com
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: SBS Health Check
  run: |
    python health_check.py --silent
    if [ $? -ne 0 ]; then
      echo "Health check failed"
      exit 1
    fi
```

## 🔒 Security Considerations

- **Environment Variables**: Never commit `.env` files to version control
- **API Keys**: Use environment variables for all sensitive data
- **Network Access**: Run checks from trusted networks only
- **Log Sensitivity**: JSON exports may contain sensitive information

## 📚 Related Documentation

- [Docker Deployment Guide](DEPLOYMENT.md)
- [Environment Configuration](.env.example)
- [Database Schema](SCHEMA.sql)
- [n8n Workflows](n8n/)

---

The SBS Health Check Tool provides comprehensive monitoring for your entire n8n ecosystem, ensuring reliable operation and quick issue detection! 🎯
# Maintenance Scripts

This directory contains health check and maintenance scripts for the SBS ecosystem.

## Files

- `health_check.py` - Main Python health check script with comprehensive system monitoring
- `health_check.sh` - Unix/Linux wrapper script for running health checks
- `health_check.bat` - Windows batch wrapper script for running health checks  
- `HEALTH_CHECK.md` - Complete documentation for the health check system

## Usage

### Linux/macOS:
```bash
./health_check.sh                    # Run all checks
./health_check.sh --quick            # Run basic checks only
./health_check.sh --docker-only      # Check Docker services only
```

### Windows:
```cmd
health_check.bat                     # Run all checks
health_check.bat --quick             # Run basic checks only
health_check.bat --docker-only       # Check Docker services only
```

### Direct Python:
```bash
python health_check.py               # Run all checks
```

## Features

- Docker container health monitoring
- Database connectivity checks
- n8n API endpoint validation
- Webhook functionality testing
- System resource monitoring
- JSON export capabilities
- Cross-platform compatibility
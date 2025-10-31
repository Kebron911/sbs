# 🛠️ Database Maintenance Subflows

## Overview

This collection of 5 n8n subflows provides comprehensive database examination, cleanup, and maintenance capabilities for your SBS ecosystem. Each subflow can be triggered via webhooks and provides detailed analysis and automated maintenance operations.

## 📁 Subflows Included

### 1. 🔍 Database Health Analyzer
**File:** `database_health_analyzer.json`  
**Webhook:** `/webhook/db-health-analyzer`

Comprehensive database health monitoring and analysis.

#### Features:
- **Table Analysis**: Size, usage statistics, dead tuple analysis
- **Index Usage**: Performance metrics and unused index detection
- **Database Overview**: Size, connections, version info
- **Bloat Analysis**: Table bloat detection and recommendations
- **Health Alerts**: Automated issue detection and recommendations

#### Usage Examples:
```bash
# Comprehensive health check
curl -X POST http://localhost:5678/webhook/db-health-analyzer \
  -H "Content-Type: application/json" \
  -d '{"action": "table_analysis"}'

# Bloat analysis only
curl -X POST http://localhost:5678/webhook/db-health-analyzer \
  -H "Content-Type: application/json" \
  -d '{"action": "bloat_analysis"}'
```

#### Response Format:
```json
{
  "timestamp": "2025-10-29T10:30:00.000Z",
  "analysis_type": "comprehensive_health_check",
  "database_overview": {
    "database_size": {"value": "45 MB", "description": "Total database size on disk"},
    "active_connections": {"value": "3", "description": "Current active database connections"}
  },
  "table_analysis": {
    "total_tables": 31,
    "health_alerts": [
      {
        "severity": "warning",
        "table": "system_logs",
        "issue": "High dead tuple percentage",
        "value": "25%",
        "recommendation": "Consider running VACUUM on this table"
      }
    ]
  },
  "recommendations": [
    {
      "type": "maintenance",
      "priority": "high",
      "description": "Tables with high dead tuple percentage detected",
      "action": "Schedule VACUUM operations for affected tables"
    }
  ]
}
```

---

### 2. 🧹 Database Cleanup Manager
**File:** `database_cleanup_manager.json`  
**Webhook:** `/webhook/db-cleanup-manager`

Automated database cleanup operations for logs, orphaned records, and maintenance tasks.

#### Features:
- **Log Cleanup**: Remove old system logs, events, and AI logs based on retention policy
- **Orphan Cleanup**: Find and remove orphaned records across all tables
- **Vacuum Analysis**: Identify tables needing VACUUM operations
- **Duplicate Detection**: Find potential duplicate records

#### Usage Examples:
```bash
# Clean up old logs (90 days retention)
curl -X POST http://localhost:5678/webhook/db-cleanup-manager \
  -H "Content-Type: application/json" \
  -d '{"operation": "cleanup_logs", "retention_days": 90}'

# Clean up orphaned records
curl -X POST http://localhost:5678/webhook/db-cleanup-manager \
  -H "Content-Type: application/json" \
  -d '{"operation": "cleanup_orphans"}'

# Analyze vacuum needs
curl -X POST http://localhost:5678/webhook/db-cleanup-manager \
  -H "Content-Type: application/json" \
  -d '{"operation": "vacuum_tables", "auto_execute": false, "max_tables": 5}'

# Find duplicate records
curl -X POST http://localhost:5678/webhook/db-cleanup-manager \
  -H "Content-Type: application/json" \
  -d '{"operation": "duplicate_check"}'
```

#### Response Format:
```json
{
  "timestamp": "2025-10-29T10:30:00.000Z",
  "operation": "cleanup_logs",
  "status": "completed",
  "summary": {
    "system_logs_deleted": 1250,
    "events_deleted": 890,
    "ai_logs_deleted": 340,
    "total_records_deleted": 2480
  },
  "recommendations": [
    {
      "type": "maintenance",
      "priority": "low",
      "description": "Successfully cleaned up 2480 old log records",
      "action": "Consider running VACUUM on affected tables to reclaim space"
    }
  ]
}
```

---

### 3. 📊 Database Performance Monitor
**File:** `database_performance_monitor.json`  
**Webhook:** `/webhook/db-performance-monitor`

Real-time database performance monitoring and optimization recommendations.

#### Features:
- **Query Performance**: Slow query detection and analysis
- **Table Statistics**: Usage patterns and performance metrics
- **Index Analysis**: Index usage and optimization opportunities
- **Performance Alerts**: Automated performance issue detection

#### Usage Examples:
```bash
# Query performance analysis
curl -X POST http://localhost:5678/webhook/db-performance-monitor \
  -H "Content-Type: application/json" \
  -d '{"metric_type": "query_performance", "limit": 20}'

# Table performance analysis
curl -X POST http://localhost:5678/webhook/db-performance-monitor \
  -H "Content-Type: application/json" \
  -d '{"metric_type": "table_stats"}'
```

#### Response Format:
```json
{
  "timestamp": "2025-10-29T10:30:00.000Z",
  "metric_type": "query_performance",
  "performance_summary": {
    "total_queries_analyzed": 45,
    "slow_queries_count": 3,
    "frequent_queries_count": 12,
    "avg_hit_percent": 94.5
  },
  "alerts": [
    {
      "severity": "warning",
      "type": "slow_query",
      "message": "Query with mean time 1250ms detected",
      "query_preview": "SELECT * FROM system_logs WHERE created_at > '2025-01-01' ORDER BY created_at DESC...",
      "recommendation": "Consider optimizing this query or adding appropriate indexes"
    }
  ],
  "recommendations": [
    {
      "type": "performance",
      "priority": "medium",
      "description": "3 performance alerts detected",
      "action": "Review alerts and implement recommended optimizations"
    }
  ]
}
```

---

### 4. 🔒 Database Security Auditor
**File:** `database_security_auditor.json`  
**Webhook:** `/webhook/db-security-auditor`

Comprehensive security auditing for user permissions, data integrity, and access patterns.

#### Features:
- **User Permissions**: Role analysis and privilege auditing
- **Data Integrity**: Constraint violation detection and data quality checks
- **Access Patterns**: Suspicious activity and login pattern analysis
- **Security Scoring**: Risk assessment with actionable recommendations

#### Usage Examples:
```bash
# User permissions audit
curl -X POST http://localhost:5678/webhook/db-security-auditor \
  -H "Content-Type: application/json" \
  -d '{"audit_type": "user_permissions"}'

# Data integrity check
curl -X POST http://localhost:5678/webhook/db-security-auditor \
  -H "Content-Type: application/json" \
  -d '{"audit_type": "data_integrity"}'

# Access pattern analysis
curl -X POST http://localhost:5678/webhook/db-security-auditor \
  -H "Content-Type: application/json" \
  -d '{"audit_type": "access_patterns"}'
```

#### Response Format:
```json
{
  "timestamp": "2025-10-29T10:30:00.000Z",
  "audit_type": "user_permissions",
  "security_score": 85,
  "findings": [
    {
      "severity": "medium",
      "category": "privilege_management",
      "description": "3 users can create roles",
      "recommendation": "Limit role creation privileges to database administrators",
      "risk_score": 10
    }
  ],
  "compliance_status": "partially_compliant",
  "risk_level": "medium",
  "recommendations": [
    {
      "priority": "medium",
      "category": "security",
      "description": "1 security issues identified",
      "action": "Address security findings in order of severity and risk score"
    }
  ]
}
```

---

### 5. 📈 Database Backup & Recovery Manager
**File:** `database_backup_recovery.json`  
**Webhook:** `/webhook/db-backup-recovery`

Complete backup and recovery management system with automated operations.

#### Features:
- **Create Backups**: Full database backups with compression and metadata
- **List Backups**: Inventory of available backups with details
- **Restore Operations**: Database restoration with safety checks
- **Backup Status**: System analysis and backup health monitoring

#### Usage Examples:
```bash
# Create a new backup
curl -X POST http://localhost:5678/webhook/db-backup-recovery \
  -H "Content-Type: application/json" \
  -d '{"operation": "create_backup"}'

# List available backups
curl -X POST http://localhost:5678/webhook/db-backup-recovery \
  -H "Content-Type: application/json" \
  -d '{"operation": "list_backups"}'

# Restore from backup (with safety confirmation)
curl -X POST http://localhost:5678/webhook/db-backup-recovery \
  -H "Content-Type: application/json" \
  -d '{
    "operation": "restore_backup",
    "backup_file": "sbs_backup_20251029_103000.sql",
    "restore_type": "full",
    "target_database": "lifeos_db_test",
    "confirm_production": "false"
  }'

# Get backup status and recommendations
curl -X POST http://localhost:5678/webhook/db-backup-recovery \
  -H "Content-Type: application/json" \
  -d '{"operation": "backup_status"}'
```

#### Response Format:
```json
{
  "timestamp": "2025-10-29T10:30:00.000Z",
  "operation": "create_backup",
  "status": "success",
  "details": {
    "backup_file": "sbs_backup_20251029_103000.sql",
    "backup_size": "45MB",
    "backup_path": "/backup/postgres/sbs_backup_20251029_103000.sql",
    "backup_type": "full",
    "compression": "gzip-9",
    "format": "custom"
  },
  "recommendations": [
    {
      "priority": "low",
      "description": "Backup created successfully: sbs_backup_20251029_103000.sql (45MB)",
      "action": "Verify backup integrity and store in secure location"
    }
  ]
}
```

## 🚀 Quick Start Guide

### 1. Import Subflows
Import all 5 JSON files into your n8n instance:
1. Go to **Workflows** in n8n
2. Click **Import from File**
3. Select each JSON file and import
4. Activate the imported workflows

### 2. Configure Database Credentials
Ensure your PostgreSQL credentials are configured in n8n:
- Credential name: `postgres_main`
- Connection details should match your Docker setup

### 3. Test Basic Functionality
```bash
# Test database health analyzer
curl -X POST http://localhost:5678/webhook/db-health-analyzer \
  -H "Content-Type: application/json" \
  -d '{"action": "table_analysis"}'
```

### 4. Set Up Automated Monitoring
Create scheduled workflows that call these endpoints:
- **Daily**: Health analysis and performance monitoring
- **Weekly**: Security audit and cleanup operations
- **Monthly**: Comprehensive backup verification

## 📋 Maintenance Schedule Recommendations

### Daily Operations
- Database health check
- Performance monitoring
- Log cleanup (if high volume)

### Weekly Operations
- Security audit
- Orphan record cleanup
- Backup creation
- Vacuum analysis

### Monthly Operations
- Comprehensive security audit
- Backup integrity testing
- Performance optimization review
- Cleanup of old backups

## 🔧 Customization Options

### Health Analyzer
- Modify retention policies in cleanup operations
- Adjust performance thresholds for alerts
- Add custom health checks for specific tables

### Cleanup Manager
- Configure retention periods for different log types
- Add custom orphan detection logic
- Implement automatic vacuum execution

### Performance Monitor
- Customize slow query thresholds
- Add application-specific performance metrics
- Configure alerting for critical performance issues

### Security Auditor
- Define custom security policies
- Add organization-specific compliance checks
- Configure risk scoring parameters

### Backup Manager
- Customize backup schedules and retention
- Add backup verification procedures
- Configure off-site backup storage

## 🚨 Safety Considerations

### Production Environment
- **Always test operations in development first**
- **Use backup confirmations for restore operations**
- **Monitor system resources during maintenance**
- **Schedule intensive operations during low-traffic periods**

### Access Control
- Limit webhook access to authorized systems only
- Use authentication tokens where possible
- Monitor audit logs for unauthorized access

### Backup Safety
- Verify backup integrity before relying on them
- Test restore procedures regularly
- Maintain multiple backup generations
- Store backups in secure, accessible locations

## 📞 Support and Troubleshooting

### Common Issues
1. **Database Connection Errors**: Verify credentials and network connectivity
2. **Permission Denied**: Ensure database user has required privileges
3. **Backup Failures**: Check disk space and backup directory permissions
4. **Performance Impact**: Monitor resource usage during operations

### Debug Mode
Add `"debug": true` to webhook payloads for verbose output and detailed error messages.

### Monitoring Integration
These subflows integrate with your existing monitoring systems and can send alerts via:
- System logs
- Webhook notifications
- Email alerts (with additional configuration)
- Slack/Teams integration

---

**Your SBS database now has enterprise-grade maintenance capabilities!** 🎉

These subflows provide comprehensive database management tools that can be easily automated and integrated into your existing workflows.
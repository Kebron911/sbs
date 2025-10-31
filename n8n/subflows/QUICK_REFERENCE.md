# SBS n8n Subflows - Quick Reference Index

## 🔍 Find Subflows by Function

### AI & Content Processing
- **AI Content Generation**: `ai_operations/ai_content_generation.json`
- **AI Response Parsing**: `ai_operations/ai_response_parser.json`

### Character Operations  
- **Character Data Fetching**: `character_management/character_data_fetching.json` ⭐
- **Economy Updates**: `character_management/character_economy_update.json` ⭐
- **Level Progression**: `character_management/character_level_progression.json`

### Database & Validation
- **Database Transactions**: `database_operations/database_transaction_handler.json` ⭐⭐
- **Database Queries**: `database_operations/database_query.json` ⭐
- **Database Health**: `database_maintenance/database_health_analyzer.json` ⭐
- **Input Validation**: `validation_responses/validate_input.json` ⭐⭐
- **Error Handling**: `validation_responses/error_response_handler.json` ⭐⭐
- **Webhook Responses**: `validation_responses/respond_to_webhook.json`
- **Standardized Responses**: `validation_responses/standardized_response.json`

### Game Mechanics
- **Level/XP Calculator**: `game_mechanics/level_xp_calculator.json` ⭐⭐
- **Reward Calculation**: `game_mechanics/reward_calculation.json`
- **Streak Calculation**: `game_mechanics/streak_calculation.json`
- **System Stages**: `game_mechanics/system_stage_management.json`
- **Achievements**: `game_mechanics/trigger_achievement_check.json`
- **Skill Progression**: `game_mechanics/trigger_skill_progression.json`

### HTTP & Communication
- **HTTP Webhook Router**: `utility_functions/http_webhook_router.json` ⭐⭐
- **Conditional Logic Router**: `utility_functions/conditional_logic_router.json` ⭐⭐
- **Timestamp Generator**: `utility_functions/timestamp_generator.json`
- **Telegram Sending**: `communication/send_telegram_response.json`
- **Command Parsing**: `communication/telegram_command_parser.json`

### Logging & Events
- **Enhanced System Logs**: `logging_events/enhanced_system_logs_writer.json` ⭐⭐
- **Event Logging**: `logging_events/log_event.json`
- **System Logging**: `logging_events/log_system_event.json`

### Database Maintenance
- **Health Analyzer**: `database_maintenance/database_health_analyzer.json` ⭐
- **Performance Monitor**: `database_maintenance/database_performance_monitor.json`
- **Cleanup Manager**: `database_maintenance/database_cleanup_manager.json`
- **Backup Recovery**: `database_maintenance/database_backup_recovery.json`
- **Migration Manager**: `database_maintenance/database_migration_manager.json`
- **Security Auditor**: `database_maintenance/database_security_auditor.json`
- **Analytics Reporter**: `database_maintenance/database_analytics_reporter.json`
- **SBS Data Optimizer**: `database_maintenance/sbs_data_optimizer.json`

---

## 🏆 Most Used Subflows (⭐⭐ = Critical, ⭐ = High Priority)

### **🎯 Critical Infrastructure (⭐⭐)**
1. **database_transaction_handler** - Universal database operations with transactions
2. **http_webhook_router** - HTTP request routing with retry logic
3. **error_response_handler** - Centralized error handling and alerting
4. **level_xp_calculator** - Game mechanics calculations
5. **conditional_logic_router** - Advanced conditional routing
6. **enhanced_system_logs_writer** - Professional logging system

### **📊 High Priority (⭐)**
7. **character_data_fetching** - Comprehensive character data retrieval
8. **character_economy_update** - Update character coins, XP, HP
9. **validate_input** - Validate request data with presets
10. **database_query** - Execute database operations
11. **database_health_analyzer** - Monitor database health and performance

---

## 🔗 Common Integration Patterns

### Database Operations
```javascript
// Universal database transaction
{
  "operation": "SELECT|INSERT|UPDATE|DELETE",
  "table": "characters", 
  "conditions": { "id": 123 },
  "fields": { "xp": 50 },
  "return_first_only": true
}
```

### HTTP Requests with Retry
```javascript
// HTTP webhook routing
{
  "target_webhook": "achievement-check",
  "method": "POST",
  "body_data": { "character_id": 123 },
  "retry_on_failure": true
}
```

### Error Handling
```javascript
// Centralized error response
{
  "error_type": "validation_error",
  "message": "Invalid character ID",
  "context": { "character_id": 123 }
}
```

### Conditional Logic
```javascript
// Advanced conditional routing
{
  "routing_mode": "first_match",
  "conditions": [{
    "field": "character.level",
    "operator": "gte",
    "value": 10,
    "route": "high_level_path"
  }]
}
```

---

*Last Updated: October 30, 2025*
*Total Subflows: 33*
*Categories: 9*
*Status: Production Ready*
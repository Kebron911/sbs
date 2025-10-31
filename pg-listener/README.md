# LifeOS PostgreSQL Listener Service

## 📡 Overview

The pg-listener service monitors PostgreSQL database changes and forwards notifications to n8n workflows, enabling real-time event-driven automation in the SBS ecosystem.

## 🚀 Features

- **Database Event Monitoring**: Listens to PostgreSQL NOTIFY events
- **Webhook Integration**: Forwards events to n8n workflows via webhooks
- **Multi-Channel Support**: Monitors multiple database channels simultaneously
- **Error Handling**: Robust error handling with detailed logging
- **Docker Ready**: Containerized for easy deployment

## 📋 Monitored Events

The service listens to these PostgreSQL channels:

### `system_update`
- Triggered when systems table is updated
- Forwards system changes to n8n workflows
- Enables automated system progression tracking

### `unified_event`
- Triggered when habits or tasks tables are updated
- Forwards game events to n8n workflows
- Enables real-time achievement processing

## 🔧 Configuration

### Environment Variables

The service requires these environment variables (configured in `.env`):

```bash
# Database Connection
DB_HOST=postgres
DB_PORT=5432
DB_USER=lifeos_app
DB_PASSWORD=your_secure_password
DB_NAME=lifeos_db

# n8n Integration
N8N_WEBHOOK_BASE_URL=https://your-n8n-domain.com
```

### Database Triggers

The following triggers are already configured in the database schema:

```sql
-- System update trigger
CREATE TRIGGER systems_notify_trigger
AFTER INSERT OR UPDATE ON systems
FOR EACH ROW EXECUTE FUNCTION notify_system_update();

-- Unified event triggers
CREATE TRIGGER habits_notify_trigger
AFTER INSERT OR UPDATE ON habits
FOR EACH ROW EXECUTE FUNCTION notify_unified_event();

CREATE TRIGGER tasks_notify_trigger
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW EXECUTE FUNCTION notify_unified_event();
```

## 🐳 Docker Deployment

The service is automatically deployed as part of the main docker-compose stack:

```yaml
pg-listener:
  build: ./pg-listener
  environment:
    - DB_HOST=postgres
    - DB_PORT=5432
    - DB_USER=${DB_USER}
    - DB_PASSWORD=${DB_PASSWORD}
    - DB_NAME=${DB_NAME}
    - N8N_WEBHOOK_BASE_URL=${N8N_WEBHOOK_BASE_URL}
  depends_on:
    - postgres
    - n8n
  restart: unless-stopped
```

## 📊 Monitoring

### Health Checks

Monitor the service status:

```bash
# Check container status
docker-compose ps pg-listener

# View service logs
docker-compose logs -f pg-listener

# Test database connection
docker-compose exec pg-listener node -e "
  const { Client } = require('pg');
  const client = new Client(process.env);
  client.connect().then(() => console.log('✅ Connected')).catch(console.error);
"
```

### Log Output

The service provides detailed logging:

```
✅ Connected to PostgreSQL
👂 Listening to: system_update, unified_event
📢 Notification received: system_update
✅ Forwarded to n8n: system_update
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Connection Failed
```bash
# Check database connectivity
docker-compose logs postgres
docker-compose logs pg-listener

# Verify environment variables
docker-compose exec pg-listener env | grep DB_
```

#### 2. Webhook Forwarding Failed
```bash
# Check n8n webhook endpoint
curl -X POST ${N8N_WEBHOOK_BASE_URL}/webhook/pg-notify \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Verify n8n is accessible
docker-compose logs n8n
```

#### 3. Database Triggers Not Working
```sql
-- Check if triggers exist
SELECT tgname, tgrelid::regclass, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE '%notify%';

-- Test trigger manually
UPDATE systems SET updated_at = now() WHERE id = 1;
```

## 🔄 Integration with n8n

### Webhook Workflow

Create an n8n workflow with a webhook trigger:

1. **Webhook Node**: Configure endpoint `/webhook/pg-notify`
2. **IF Node**: Filter by `channel` type
3. **Processing Nodes**: Handle specific event types
4. **Response Node**: Acknowledge receipt

### Event Processing

The service forwards events in this format:

```json
{
  "channel": "system_update",
  "payload": {
    "id": 123,
    "name": "My System",
    "current_stage": "design",
    "updated_at": "2025-10-28T10:30:00Z"
  }
}
```

## 📝 Development

### Local Development

```bash
# Install dependencies
cd pg-listener
npm install

# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_USER=lifeos_app
export DB_PASSWORD=your_password
export DB_NAME=lifeos_db
export N8N_WEBHOOK_BASE_URL=http://localhost:5678

# Run locally
node listener.js
```

### Testing

```bash
# Test database triggers
psql -h localhost -U lifeos_app -d lifeos_db -c "
  INSERT INTO systems (name, category) VALUES ('Test System', 'productivity');
"

# Should see notification in pg-listener logs
```

## 🔐 Security

### Best Practices

- Use read-only database user when possible
- Secure webhook endpoints with authentication
- Monitor for unusual notification patterns
- Implement rate limiting for webhook calls

### Database Permissions

The service requires these permissions:

```sql
-- Minimum required permissions
GRANT CONNECT ON DATABASE lifeos_db TO lifeos_app;
GRANT USAGE ON SCHEMA public TO lifeos_app;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO lifeos_app;
```

## 🚀 Performance

### Optimization Tips

- Use connection pooling for high-volume environments
- Implement batching for multiple rapid notifications
- Monitor memory usage with many concurrent connections
- Consider Redis for notification queuing in large deployments

### Scaling

For high-throughput environments:

1. **Multiple Listeners**: Deploy multiple instances with load balancing
2. **Queue Integration**: Add Redis/RabbitMQ for reliable message delivery
3. **Webhook Pools**: Use connection pooling for n8n webhook calls
4. **Monitoring**: Add metrics collection and alerting

---

## 📚 Related Documentation

- [Database Schema](../database/schema.sql) - Complete database structure
- [Docker Deployment](../docs/DEPLOYMENT.md) - Full deployment guide
- [n8n Workflows](../n8n/) - Workflow configurations
- [Environment Configuration](../.env.example) - Environment setup

The pg-listener service is a critical component of the SBS ecosystem, enabling real-time event-driven automation! 🔄
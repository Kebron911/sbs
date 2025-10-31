# 🔌 SBS Port Configuration

## Service Ports (Updated to Avoid Conflicts)

| Service | Internal Port | External Port | URL/Connection |
|---------|---------------|---------------|----------------|
| **n8n** | 5678 | **15678** | http://localhost:15678 |
| **PostgreSQL** | 5432 | **15432** | localhost:15432 |
| **Adminer** | 8080 | **18080** | http://localhost:18080 |
| **Redis** | 6379 | **16379** | localhost:16379 |
| **Postgres Exporter** | 9187 | **19187** | http://localhost:19187 |

## Why Custom Ports?

These custom ports (15xxx range) are used to avoid conflicts with:
- Existing n8n installations (port 5678)
- Local PostgreSQL instances (port 5432)
- Other Adminer instances (port 8080)
- Local Redis instances (port 6379)
- Other monitoring tools (port 9187)

## Configuration Notes

### n8n Access
- **Web Interface**: http://localhost:15678
- **Webhooks**: http://localhost:15678/webhook/[webhook-name]
- **API**: http://localhost:15678/rest/

### Database Access
- **Host**: localhost
- **Port**: 15432
- **Database**: lifeos_db
- **Username**: lifeos_app
- **Connection String**: postgresql://lifeos_app:password@localhost:15432/lifeos_db

### Adminer (Database Management)
- **URL**: http://localhost:18080
- **Server**: postgres (or localhost:15432 from external)
- **Username**: lifeos_app
- **Database**: lifeos_db

## Changing Ports

To change ports, update:
1. `docker-compose.yml` - External port mappings
2. `.env.example` - N8N_WEBHOOK_BASE_URL
3. `deploy.sh` - Service URL documentation
4. `DEPLOYMENT.md` - Documentation
5. This file - Port reference

## Internal vs External Ports

- **Internal Ports**: Used for container-to-container communication (unchanged)
- **External Ports**: Used for host access and external connections (customized to 15xxx range)

Docker handles the port mapping automatically.
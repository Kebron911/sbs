# Logs Directory

This directory contains log files from various services.

## Structure

- `pg-listener/` - PostgreSQL listener service logs

## Usage

Logs are automatically written here by the services. You can monitor them with:

```bash
# View pg-listener logs
tail -f logs/pg-listener/app.log

# View all Docker service logs
docker-compose logs -f
```
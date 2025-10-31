# SSL Certificates Directory

This directory contains SSL certificates for n8n and other services.

## Files

Place your SSL certificate files here:
- `gehealthcare-ca-bundle.pem` - CA certificate bundle (referenced in docker-compose.yml)
- Other certificate files as needed

## Usage

Certificates placed in this directory are mounted to `/certs/` inside the n8n container and can be referenced in the NODE_EXTRA_CA_CERTS environment variable.

## Security Note

- Keep certificate files secure
- Use appropriate file permissions (readable by container processes)
- Consider adding specific certificate files to .gitignore if they contain sensitive information
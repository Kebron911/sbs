# Database Files

This directory contains database-related files for the SBS system.

## Files

- `schema.sql` - Complete PostgreSQL database schema with tables, indexes, and initial data
  - Contains all table definitions for the SBS ecosystem
  - Includes indexes for performance optimization
  - Sets up initial system data and configuration

## Usage

The schema.sql file is automatically loaded when the PostgreSQL container starts via docker-compose.yml.

For manual database setup:
```bash
psql -U lifeos_app -d lifeos_db -f schema.sql
```
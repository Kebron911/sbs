# Data Directory

This directory contains persistent data for all Docker services, making the entire project portable.

## Structure

- `postgres/` - PostgreSQL database files and data
- `n8n/` - n8n workflow and configuration data
- `redis/` - Redis cache and session data

## Purpose

These local folders replace Docker volumes to make the project completely self-contained and portable. You can copy the entire SBS folder to another computer and all data will be preserved.

## Backup

These folders contain all persistent data. To backup your SBS installation:
1. Stop all services: `docker-compose down`
2. Copy the entire `data/` folder
3. Also copy the main project folder

## Restore

To restore on another computer:
1. Copy the entire SBS project folder (including `data/`)
2. Run: `docker-compose up -d`
3. All data and configurations will be preserved
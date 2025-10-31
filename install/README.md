# Installation Files

This directory contains files needed for installing and setting up dependencies for the SBS system.

## Files

- `requirements.txt` - Python package dependencies
  - Lists all required Python packages with version specifications
  - Used by health check scripts and maintenance tools

## Usage

Install dependencies with:
```bash
pip install -r requirements.txt
```

This is automatically handled by the health check scripts when run.
#!/bin/bash
# Render build script for SMRS backend

set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Removing old database (if any)..."
rm -f db.sqlite3

echo "Running fresh migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Build complete!"

#!/bin/bash

# Script to apply database updates for UFC 323 betting system
# This script applies the fight categories migration and loads UFC 323 test data

echo "=================================================="
echo "UFC 323 Betting System - Database Update Script"
echo "=================================================="
echo ""

# Database credentials (update these if needed)
DB_HOST="localhost"
DB_USER="root"
DB_NAME="ufc_analytics"

# Prompt for password
echo "Enter MySQL password for user '$DB_USER':"
read -s DB_PASS
echo ""

# Apply fight categories migration
echo "1. Applying fight categories migration..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < migrations/2026-01-14-fight-categories.sql
if [ $? -eq 0 ]; then
    echo "   ✓ Fight categories migration applied successfully"
else
    echo "   ✗ Error applying fight categories migration"
    exit 1
fi
echo ""

# Load UFC 323 data
echo "2. Loading UFC 323 test data..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME < seed_ufc_323_updated.sql
if [ $? -eq 0 ]; then
    echo "   ✓ UFC 323 data loaded successfully"
else
    echo "   ✗ Error loading UFC 323 data"
    exit 1
fi
echo ""

echo "=================================================="
echo "Database updates completed successfully!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Start the backend server: cd src && node app.js"
echo "2. Start the frontend: cd frontend && npm run dev"
echo "3. Login with your user credentials"
echo "4. Navigate to 'Ver Eventos' to see UFC 323"
echo "5. Click on the event to make your bets!"
echo ""

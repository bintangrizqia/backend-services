#!/bin/bash
set -e  # Stop on any error

# Jalankan semua sync script secara berurutan
echo "Running master type position..."
npx tsx ./src/scripts/sync-master-type-position.ts
echo "Done"
echo "Running master organization..."
npx tsx ./src/scripts/sync-master-organization.ts
echo "Done"
echo "Running master type unit..."
npx tsx ./src/scripts/sync-master-type-unit.ts
echo "Done"
echo "Running master position"
npx tsx ./src/scripts/sync-master-position.ts
echo "Done"
echo "Running master personnels..."
npx tsx ./src/scripts/sync-master-personnel.ts
echo "All process already syncing. Be happy : )"

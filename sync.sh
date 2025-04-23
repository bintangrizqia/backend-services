#!/bin/bash

# Jalankan semua sync script secara berurutan
npx tsx ./src/scripts/sync-master-type-position.ts
npx tsx ./src/scripts/sync-master-position.ts
npx tsx ./src/scripts/sync-master-type-unit.ts
npx tsx ./src/scripts/sync-master-organization.ts
npx tsx ./src/scripts/sync-master-personnel.ts

/**
 * checkIndexStatus.js — verifica o status do índice Atlas Search "default".
 * Usage: node -r dotenv/config checkIndexStatus.js
 */
import { MongoClient } from 'mongodb';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require('dotenv').config({ path: join(__dirname, '../backend/.env') });

const client = new MongoClient(process.env.MONGODB_URI);

try {
  await client.connect();
  const arr = await client.db().collection('restaurants').listSearchIndexes('default').toArray();
  const idx = arr[0];
  if (!idx) {
    console.log('No index named "default" found.');
  } else {
    console.log(`status: ${idx.status} | queryable: ${idx.queryable}`);
    if (idx.queryable) {
      console.log('✓ Index is ready!');
    } else {
      console.log('⏳ Index is still building...');
    }
  }
} finally {
  await client.close();
}

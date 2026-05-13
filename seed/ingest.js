/**
 * ingest.js — ingere os restaurantes gerados em restaurants.json no MongoDB Atlas.
 * Requer MONGODB_URI no ambiente.
 *
 * Usage: node -r dotenv/config ingest.js
 *        (ou via npm run seed no backend)
 */

import { MongoClient } from 'mongodb';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Suporte a dotenv via require quando chamado diretamente
try {
  const dotenv = require('dotenv');
  dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') });
} catch (_) {
  // dotenv não disponível — variáveis já devem estar no ambiente
}

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not set. Copy seed/.env.example to seed/.env and fill it in.');
  process.exit(1);
}

const restaurantsPath = join(__dir, 'restaurants.json');
if (!existsSync(restaurantsPath)) {
  console.error('ERROR: restaurants.json not found. Run: node seed/generate.js first.');
  process.exit(1);
}

const restaurants = JSON.parse(readFileSync(restaurantsPath, 'utf-8'));

const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  const db = client.db();
  const collection = db.collection('restaurants');

  // Cria índice 2dsphere para consultas geoespaciais
  await collection.createIndex({ location: '2dsphere' });
  console.info('✓ 2dsphere index ensured on location');

  // Insere em lotes para eficiência
  const BATCH_SIZE = 100;
  let inserted = 0;
  for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
    const batch = restaurants.slice(i, i + BATCH_SIZE);
    const result = await collection.insertMany(batch, { ordered: false });
    inserted += result.insertedCount;
  }

  console.info(`✓ Inserted ${inserted} restaurants into 'restaurants' collection`);
} finally {
  await client.close();
}

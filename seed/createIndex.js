/**
 * createIndex.js — cria o índice Atlas Search na coleção restaurants.
 * Requer MONGODB_URI no ambiente e acesso à API de Data API ou driver direto.
 *
 * NOTA: A criação de índices Atlas Search requer que a coleção já exista
 * com dados (execute ingest.js antes).
 *
 * O índice é criado via driver MongoDB usando o comando createSearchIndexes,
 * disponível a partir da versão 7.0 do MongoDB Atlas.
 *
 * Usage: node -r dotenv/config createIndex.js
 */

import { MongoClient } from 'mongodb';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

try {
  const dotenv = require('dotenv');
  dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') });
} catch (_) {
  // dotenv não disponível
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI not set.');
  process.exit(1);
}

const SEARCH_INDEX_DEFINITION = {
  name: 'default',
  type: 'search',
  definition: {
    mappings: {
      dynamic: false,
      fields: {
        name: [
          {
            type: 'autocomplete',
            analyzer: 'lucene.standard',
            tokenization: 'edgeGram',
            minGrams: 2,
            maxGrams: 15,
            foldDiacritics: true,
          },
          {
            type: 'string',
            analyzer: 'lucene.standard',
          },
        ],
        cuisine: [
          {
            type: 'string',
            analyzer: 'lucene.standard',
          },
          {
            type: 'stringFacet',
          },
        ],
        neighborhood: {
          type: 'string',
          analyzer: 'lucene.standard',
        },
        categories: {
          type: 'string',
          analyzer: 'lucene.standard',
        },
        city: {
          type: 'string',
          analyzer: 'lucene.keyword',
        },
        priceRange: [
          {
            type: 'number',
          },
          {
            type: 'numberFacet',
          },
        ],
        rating: [
          {
            type: 'number',
          },
          {
            type: 'numberFacet',
          },
        ],
        location: {
          type: 'geo',
        },
      },
    },
  },
};

const client = new MongoClient(MONGODB_URI);

try {
  await client.connect();
  const db = client.db();
  const collection = db.collection('restaurants');

  console.info('Creating Atlas Search index "default" on restaurants collection...');

  // Drop existing index if present, then recreate with updated definition
  try {
    await collection.dropSearchIndex('default');
    console.info('  Dropped existing "default" index, recreating...');
    // Wait briefly to allow Atlas to process the drop
    await new Promise((resolve) => setTimeout(resolve, 3000));
  } catch (err) {
    if (!err.message?.includes('index not found') && err.codeName !== 'IndexNotFound') {
      console.warn('  Could not drop existing index (may not exist yet):', err.message);
    }
  }

  await collection.createSearchIndex(SEARCH_INDEX_DEFINITION);
  console.info('✓ Atlas Search index creation initiated.');
  console.info('  Note: Index takes 1-2 minutes to become active on Atlas.');
} finally {
  await client.close();
}

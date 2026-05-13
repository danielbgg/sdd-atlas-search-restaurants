/**
 * fetchData.js — busca restaurantes reais de São Paulo via OpenStreetMap (Overpass API)
 * e salva em restaurants.json com o esquema esperado pela aplicação.
 *
 * Fonte dos dados: OpenStreetMap © Colaboradores do OpenStreetMap (ODbL 1.0)
 *   https://www.openstreetmap.org/copyright
 *
 * A API Overpass é gratuita e pública; não requer credenciais.
 *
 * Usage: node fetchData.js
 *   (ou via: npm run fetch)
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = join(__dir, 'restaurants.json');
const TARGET = Infinity; // busca todos os restaurantes disponíveis

// ─────────────────────────────────────────────────────────────────────────────
// Mapeamentos
// ─────────────────────────────────────────────────────────────────────────────

/** Mapeia valores de cuisine do OSM para rótulos em PT-BR usados na aplicação */
const CUISINE_MAP = {
  // Brasileira
  brazilian: 'brasileira',
  churrascaria: 'brasileira',
  churrasco: 'brasileira',
  regional: 'brasileira',
  'regional;barbecue': 'brasileira',
  tapioca: 'brasileira',
  // Japonesa
  japanese: 'japonesa',
  sushi: 'japonesa',
  ramen: 'japonesa',
  japanese_curry: 'japonesa',
  // Italiana
  italian: 'italiana',
  pizza: 'italiana',
  pizzeria: 'italiana',
  // Francesa
  french: 'francesa',
  crepe: 'francesa',
  // Árabe
  arab: 'árabe',
  arabian: 'árabe',
  middle_eastern: 'árabe',
  lebanese: 'árabe',
  turkish: 'árabe',
  kebab: 'árabe',
  // Mexicana
  mexican: 'mexicana',
  tex_mex: 'mexicana',
  // Peruana
  peruvian: 'peruana',
  // Portuguesa
  portuguese: 'portuguesa',
  // Chinesa
  chinese: 'chinesa',
  dim_sum: 'chinesa',
  cantonese: 'chinesa',
  // Tailandesa
  thai: 'tailandesa',
  // Indiana
  indian: 'indiana',
  // Americana
  american: 'americana',
  burger: 'americana',
  hamburger: 'americana',
  hotdog: 'americana',
  // Espanhola
  spanish: 'espanhola',
  // Mediterrânea
  mediterranean: 'mediterrânea',
  greek: 'mediterrânea',
  // Vegetariana
  vegetarian: 'vegetariana',
  vegan: 'vegetariana',
  'vegetarian;vegan': 'vegetariana',
  // Coreana
  korean: 'coreana',
  // Frutos do mar
  seafood: 'frutos do mar',
  fish: 'frutos do mar',
  sushi_and_seafood: 'frutos do mar',
};

/** Lista completa de cozinhas aceitas para fallback determinístico */
const FALLBACK_CUISINES = [
  'brasileira', 'japonesa', 'italiana', 'francesa', 'árabe',
  'mexicana', 'peruana', 'portuguesa', 'chinesa', 'tailandesa',
  'indiana', 'americana', 'espanhola', 'mediterrânea', 'vegetariana',
  'coreana', 'frutos do mar',
];

/**
 * Centróides dos principais bairros de SP, usados para inferência por proximidade
 * quando a tag addr:suburb/addr:neighbourhood não está disponível no OSM.
 */
const NEIGHBORHOODS = [
  { name: 'Pinheiros',        lat: -23.5629, lng: -46.6900 },
  { name: 'Vila Madalena',    lat: -23.5567, lng: -46.6917 },
  { name: 'Itaim Bibi',       lat: -23.5851, lng: -46.6785 },
  { name: 'Moema',            lat: -23.6027, lng: -46.6657 },
  { name: 'Jardins',          lat: -23.5748, lng: -46.6537 },
  { name: 'Consolação',       lat: -23.5538, lng: -46.6617 },
  { name: 'Bela Vista',       lat: -23.5601, lng: -46.6434 },
  { name: 'Liberdade',        lat: -23.5598, lng: -46.6335 },
  { name: 'Mooca',            lat: -23.5513, lng: -46.6049 },
  { name: 'Brooklin',         lat: -23.6187, lng: -46.6994 },
  { name: 'Santana',          lat: -23.5036, lng: -46.6263 },
  { name: 'Tatuapé',          lat: -23.5364, lng: -46.5719 },
  { name: 'Penha',            lat: -23.5233, lng: -46.5416 },
  { name: 'Butantã',          lat: -23.5701, lng: -46.7225 },
  { name: 'Lapa',             lat: -23.5213, lng: -46.7055 },
  { name: 'Perdizes',         lat: -23.5403, lng: -46.6716 },
  { name: 'Centro',           lat: -23.5502, lng: -46.6333 },
  { name: 'Campos Elíseos',   lat: -23.5382, lng: -46.6500 },
  { name: 'Vila Olímpia',     lat: -23.5969, lng: -46.6850 },
  { name: 'Morumbi',          lat: -23.6000, lng: -46.7197 },
  { name: 'Tucuruvi',         lat: -23.4861, lng: -46.6140 },
  { name: 'Santo André',      lat: -23.6592, lng: -46.5282 },
  { name: 'Saúde',            lat: -23.6128, lng: -46.6278 },
  { name: 'Ipiranga',         lat: -23.5907, lng: -46.6088 },
  { name: 'Vila Mariana',     lat: -23.5876, lng: -46.6375 },
  { name: 'Higienópolis',     lat: -23.5458, lng: -46.6568 },
  { name: 'Pompeia',          lat: -23.5329, lng: -46.6810 },
  { name: 'Água Branca',      lat: -23.5237, lng: -46.6906 },
  { name: 'Bom Retiro',       lat: -23.5282, lng: -46.6428 },
  { name: 'Brás',             lat: -23.5467, lng: -46.6200 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Funções utilitárias
// ─────────────────────────────────────────────────────────────────────────────

/** Distância em km entre dois pontos (Haversine aproximado) */
function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Bairro mais próximo para um par lat/lng */
function nearestNeighborhood(lat, lng) {
  let best = NEIGHBORHOODS[0];
  let bestDist = Infinity;
  for (const nb of NEIGHBORHOODS) {
    const d = distKm(lat, lng, nb.lat, nb.lng);
    if (d < bestDist) { bestDist = d; best = nb; }
  }
  return best.name;
}

/**
 * Número pseudo-aleatório determinístico derivado do OSM ID.
 * Garante que o mesmo restaurante sempre receba os mesmos valores
 * de priceRange, rating e reviewCount entre execuções.
 */
function seededRand(osmId, salt) {
  const n = (parseInt(String(osmId).slice(-7)) + salt * 9973) % 999983;
  return Math.abs(Math.sin(n * 127.1 + salt * 311.7));
}

function seededInt(osmId, salt, min, max) {
  return min + Math.floor(seededRand(osmId, salt) * (max - min + 1));
}

function seededFloat(osmId, salt, min, max, decimals = 1) {
  return parseFloat((min + seededRand(osmId, salt) * (max - min)).toFixed(decimals));
}

/** Mapeia cuisine OSM → PT-BR. Lida com múltiplos valores separados por ';' */
function mapCuisine(osmCuisine, osmId) {
  if (osmCuisine) {
    for (const part of osmCuisine.toLowerCase().split(/[;,]/)) {
      const trimmed = part.trim();
      if (CUISINE_MAP[trimmed]) return CUISINE_MAP[trimmed];
    }
  }
  // Fallback determinístico para manter consistência
  return FALLBACK_CUISINES[seededInt(osmId, 99, 0, FALLBACK_CUISINES.length - 1)];
}

/** Monta o endereço a partir das tags OSM */
function buildAddress(tags, neighborhood) {
  const street = tags['addr:street'];
  const number = tags['addr:housenumber'];
  if (street && number) return `${street}, ${number} - ${neighborhood}`;
  if (street) return `${street} - ${neighborhood}`;
  return `${neighborhood}, São Paulo`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Overpass API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Busca restaurantes dentro do município de São Paulo usando bounding box.
 * Usar bounding box (S,W,N,E) é mais portável entre mirrors da Overpass API
 * do que area IDs, que podem exigir sub-queries com suporte variável.
 * Bounding box de SP: S=-23.95 W=-46.80 N=-23.42 E=-46.37
 */
const SP_BBOX = '-23.95,-46.80,-23.42,-46.37'; // S,W,N,E
const OVERPASS_QUERY = `
[out:json][timeout:90];
(
  node["amenity"="restaurant"]["name"](${SP_BBOX});
  way["amenity"="restaurant"]["name"](${SP_BBOX});
);
out center;
`.trim();

console.log('⏳ Buscando restaurantes reais de São Paulo via OpenStreetMap (Overpass API)...');
console.log('   Isso pode levar 20–60 segundos dependendo da carga do servidor.\n');

let rawData;

// Mirrors públicos da Overpass API (tentados em ordem)
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function queryOverpass(baseUrl) {
  const encodedQuery = encodeURIComponent(OVERPASS_QUERY);
  // Não enviar Accept nem Accept-Encoding explicitamente:
  // a Overpass API usa [out:json] na query para definir formato, e retorna 406
  // se receber "Accept: application/json" via negociação HTTP.
  const headers = {
    'User-Agent': 'RestaurantSearchSeedScript/1.0 (SP restaurant demo)',
  };
  const resp = await fetch(baseUrl, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodedQuery,
    signal: AbortSignal.timeout(100_000),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    throw new Error(`HTTP ${resp.status} ${resp.statusText} — ${body.slice(0, 200)}`);
  }
  return resp.json();
}

let lastError;
for (const mirror of OVERPASS_MIRRORS) {
  console.log(`   Tentando ${mirror} ...`);
  try {
    rawData = await queryOverpass(mirror);
    console.log('   OK\n');
    break;
  } catch (err) {
    console.warn(`   ✗ ${err.message.split('\n')[0]}`);
    lastError = err;
  }
}

if (!rawData) {
  console.error('\n✗ Todos os mirrors da Overpass API falharam.');
  console.error('  Verifique sua conexão com a internet e tente novamente.');
  console.error('  Último erro:', lastError?.message);
  process.exit(1);
}

const elements = rawData.elements ?? [];
console.log(`   ${elements.length} elementos recebidos do OpenStreetMap.`);

// ─────────────────────────────────────────────────────────────────────────────
// Transformação e normalização
// ─────────────────────────────────────────────────────────────────────────────

const seenNames = new Set();
const restaurants = [];

// Variantes de horário típicas de restaurantes paulistanos
const HOUR_VARIANTS = [
  { open: '11:00', close: '23:00' },
  { open: '11:30', close: '23:00' },
  { open: '12:00', close: '22:00' },
  { open: '12:00', close: '23:00' },
  { open: '11:00', close: '00:00' },
  { open: '12:00', close: '00:00' },
  { open: '18:00', close: '23:00' },
  { open: '11:00', close: '22:00' },
];

for (const el of elements) {
  if (restaurants.length >= TARGET) break;

  // Coordenadas: nodes têm lat/lon; ways têm center.lat / center.lon
  const lat = el.lat ?? el.center?.lat;
  const lng = el.lon ?? el.center?.lon;
  if (lat == null || lng == null) continue;

  const tags = el.tags ?? {};
  const name = (tags.name ?? '').trim();
  if (!name) continue;

  // Deduplicação por nome (OSM pode ter o mesmo local mapeado como node e way)
  const nameKey = name.toLowerCase().replace(/\s+/g, ' ');
  if (seenNames.has(nameKey)) continue;
  seenNames.add(nameKey);

  const osmId = el.id;

  // Bairro: preferência pelas tags de endereço OSM; fallback por proximidade
  const neighborhood =
    tags['addr:suburb'] ??
    tags['addr:neighbourhood'] ??
    tags['addr:district'] ??
    nearestNeighborhood(lat, lng);

  const cuisine = mapCuisine(tags.cuisine, osmId);
  const address = buildAddress(tags, neighborhood);

  // Faixa de preço: distribuição realista (2 e 3 são mais comuns em SP)
  const pWeights = [0.10, 0.38, 0.35, 0.17]; // [$, $$, $$$, $$$$]
  const pRand = seededRand(osmId, 7);
  let priceRange = 1;
  let acc = 0;
  for (let p = 0; p < pWeights.length; p++) {
    acc += pWeights[p];
    if (pRand < acc) { priceRange = p + 1; break; }
  }

  // Avaliação: distribuição realista 3.0–5.0 com média em ~4.1
  const rating = seededFloat(osmId, 13, 3.0, 5.0, 1);

  // Contagem de reviews: entre 12 e 3.200
  const reviewCount = seededInt(osmId, 17, 12, 3200);

  const hours = HOUR_VARIANTS[seededInt(osmId, 23, 0, HOUR_VARIANTS.length - 1)];

  restaurants.push({
    name,
    location: {
      type: 'Point',
      coordinates: [
        parseFloat(lng.toFixed(6)),
        parseFloat(lat.toFixed(6)),
      ],
    },
    address,
    neighborhood,
    city: 'São Paulo',
    categories: ['restaurante'],
    cuisine,
    priceRange,
    rating,
    reviewCount,
    hours,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Resultado
// ─────────────────────────────────────────────────────────────────────────────

console.log(`   ${restaurants.length} restaurantes únicos mapeados.`);

if (restaurants.length < 1000) {
  console.warn(`\n⚠  Aviso: foram obtidos apenas ${restaurants.length} restaurantes.`);
  console.warn('   Verifique a conectividade com a Overpass API e tente novamente.');
}

const cuisineStats = restaurants.reduce((acc, r) => {
  acc[r.cuisine] = (acc[r.cuisine] ?? 0) + 1;
  return acc;
}, {});
const nbStats = restaurants.reduce((acc, r) => {
  acc[r.neighborhood] = (acc[r.neighborhood] ?? 0) + 1;
  return acc;
}, {});

console.log('\n📊 Distribuição por cozinha:');
Object.entries(cuisineStats)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([c, n]) => console.log(`   ${c.padEnd(20)} ${n}`));

console.log(`\n🗺  Bairros distintos: ${Object.keys(nbStats).length}`);

writeFileSync(OUT_PATH, JSON.stringify(restaurants, null, 2), 'utf-8');
console.log(`\n✓ ${restaurants.length} restaurantes salvos em restaurants.json`);
console.log('  Dados: OpenStreetMap © Colaboradores do OpenStreetMap (ODbL 1.0)');

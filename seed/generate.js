/**
 * generate.js — gera 1.000 restaurantes fictícios de São Paulo usando dados
 * de bairros e categorias reais. Não depende de LLM externo; usa randomização
 * local para garantir reprodutibilidade offline.
 *
 * Output: seed/restaurants.json
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

// Coordenadas aproximadas de bairros de São Paulo
const NEIGHBORHOODS = [
  { name: 'Pinheiros', lat: -23.5629, lng: -46.6900 },
  { name: 'Vila Madalena', lat: -23.5567, lng: -46.6917 },
  { name: 'Itaim Bibi', lat: -23.5851, lng: -46.6785 },
  { name: 'Moema', lat: -23.6027, lng: -46.6657 },
  { name: 'Jardins', lat: -23.5748, lng: -46.6537 },
  { name: 'Consolação', lat: -23.5538, lng: -46.6617 },
  { name: 'Bela Vista', lat: -23.5601, lng: -46.6434 },
  { name: 'Liberdade', lat: -23.5598, lng: -46.6335 },
  { name: 'Mooca', lat: -23.5513, lng: -46.6049 },
  { name: 'Brooklin', lat: -23.6187, lng: -46.6994 },
  { name: 'Santo André', lat: -23.6592, lng: -46.5282 },
  { name: 'Santana', lat: -23.5036, lng: -46.6263 },
  { name: 'Tucuruvi', lat: -23.4861, lng: -46.6140 },
  { name: 'Tatuapé', lat: -23.5364, lng: -46.5719 },
  { name: 'Penha', lat: -23.5233, lng: -46.5416 },
  { name: 'Butantã', lat: -23.5701, lng: -46.7225 },
  { name: 'Lapa', lat: -23.5213, lng: -46.7055 },
  { name: 'Perdizes', lat: -23.5403, lng: -46.6716 },
  { name: 'Centro', lat: -23.5502, lng: -46.6333 },
  { name: 'Campos Elíseos', lat: -23.5382, lng: -46.6500 },
];

const CUISINES = [
  'brasileira', 'japonesa', 'italiana', 'francesa', 'árabe',
  'mexicana', 'peruana', 'portuguesa', 'chinesa', 'tailandesa',
  'indiana', 'americana', 'espanhola', 'mediterrânea', 'vegetariana',
];

const CATEGORIES = [
  'restaurante', 'lanchonete', 'pizzaria', 'churrascaria', 'sushi',
  'café', 'bistrô', 'bar', 'hamburgueria', 'padaria',
  'food court', 'quilo', 'delivery', 'fast food', 'fine dining',
];

const ADJECTIVES = [
  'Sabor', 'Aromas', 'Tempero', 'Tradição', 'Família',
  'Estrela', 'Requinte', 'Gosto', 'Delicias', 'Varanda',
  'Terra', 'Mar', 'Rio', 'Arte', 'Cantina',
  'Bistrô', 'Mesa', 'Prato', 'Garfo', 'Colher',
];

const NOUNS = [
  'do Chef', 'da Vila', 'do Bairro', 'Paulistano', 'Carioca',
  'da Serra', 'do Porto', 'Gourmet', 'Express', 'Especial',
  'Caseiro', 'Artesanal', 'Típico', 'Imperial', 'Royal',
  'Boutique', 'Lounge', 'Garden', 'House', 'Club',
];

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRestaurant(index) {
  const neighborhood = pick(NEIGHBORHOODS);
  const cuisine = pick(CUISINES);
  const category = pick(CATEGORIES);
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS);

  // Adiciona variação de coordenadas dentro do bairro (raio ~500m)
  const latOffset = randomFloat(-0.005, 0.005);
  const lngOffset = randomFloat(-0.005, 0.005);
  const lat = neighborhood.lat + latOffset;
  const lng = neighborhood.lng + lngOffset;

  const rating = parseFloat(randomFloat(2.5, 5.0).toFixed(1));
  const priceRange = randomInt(1, 4);
  const reviewCount = randomInt(10, 2000);

  const streetNumber = randomInt(1, 999);
  const streets = ['Av. Paulista', 'Rua Augusta', 'Rua Oscar Freire', 'Rua Haddock Lobo',
    'Av. Faria Lima', 'Rua Vergueiro', 'Av. Rebouças', 'Rua Teodoro Sampaio'];
  const street = pick(streets);

  return {
    name: `${adj} ${noun} ${index + 1}`,
    location: {
      type: 'Point',
      coordinates: [parseFloat(lng.toFixed(6)), parseFloat(lat.toFixed(6))],
    },
    address: `${street}, ${streetNumber} - ${neighborhood.name}`,
    neighborhood: neighborhood.name,
    city: 'São Paulo',
    categories: [category],
    cuisine,
    priceRange,
    rating,
    reviewCount,
    hours: {
      open: '11:00',
      close: '23:00',
    },
  };
}

const COUNT = 1000;
const restaurants = Array.from({ length: COUNT }, (_, i) => generateRestaurant(i));

const outputPath = join(__dir, 'restaurants.json');
writeFileSync(outputPath, JSON.stringify(restaurants, null, 2), 'utf-8');

console.info(`✓ Generated ${COUNT} restaurants → ${outputPath}`);

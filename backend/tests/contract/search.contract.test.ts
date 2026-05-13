/**
 * Contract tests for GET /v1/restaurants/search
 * Validates that the API adheres to the OpenAPI contract.
 * Uses a mock MongoDB to avoid requiring a live Atlas connection.
 */

import request from 'supertest';
import express from 'express';
import { createSearchRouter } from '../../src/api/routes/searchRoutes';
import { errorHandler } from '../../src/api/middleware/errorHandler';
import type { Db, Collection } from 'mongodb';

function buildMockDb(results: unknown[] = []): Db {
  const mockCollection = {
    find: jest.fn().mockReturnValue({
      limit: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(results),
      }),
    }),
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(results),
    }),
  } as unknown as Collection;

  return {
    collection: jest.fn().mockReturnValue(mockCollection),
  } as unknown as Db;
}

function buildApp(db: Db): express.Application {
  const app = express();
  app.use(express.json());
  app.use('/v1/restaurants/search', createSearchRouter(db));
  app.use(errorHandler);
  return app;
}

const VALID_VIEWPORT = {
  neLat: '-23.5',
  neLng: '-46.6',
  swLat: '-23.7',
  swLng: '-46.8',
};

describe('Contract: GET /v1/restaurants/search', () => {
  it('returns 200 with total and results array for valid viewport', async () => {
    const mockDoc = {
      _id: { toString: () => 'abc123' },
      name: 'Restaurante Teste',
      location: { type: 'Point', coordinates: [-46.65, -23.6] },
      city: 'São Paulo',
    };

    const app = buildApp(buildMockDb([mockDoc]));

    const res = await request(app).get('/v1/restaurants/search').query(VALID_VIEWPORT);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('results');
    expect(Array.isArray(res.body.results)).toBe(true);
  });

  it('returns 200 with empty results when no restaurants found', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app).get('/v1/restaurants/search').query(VALID_VIEWPORT);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.results).toHaveLength(0);
  });

  it('returns 400 when required viewport params are missing', async () => {
    const app = buildApp(buildMockDb());
    const res = await request(app).get('/v1/restaurants/search').query({ neLat: '-23.5' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 when neLat <= swLat', async () => {
    const app = buildApp(buildMockDb());
    const res = await request(app).get('/v1/restaurants/search').query({
      ...VALID_VIEWPORT,
      neLat: '-23.8',
      swLat: '-23.7',
    });

    expect(res.status).toBe(400);
  });

  it('result items have required fields: id, name, location', async () => {
    const mockDoc = {
      _id: { toString: () => 'id1' },
      name: 'Restaurante A',
      location: { type: 'Point', coordinates: [-46.65, -23.6] },
      city: 'São Paulo',
    };

    const app = buildApp(buildMockDb([mockDoc]));
    const res = await request(app).get('/v1/restaurants/search').query(VALID_VIEWPORT);

    expect(res.status).toBe(200);
    const item = res.body.results[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('location');
    expect(item.location).toHaveProperty('lat');
    expect(item.location).toHaveProperty('lng');
  });

  it('accepts optional q parameter', async () => {
    const mockDoc = {
      _id: { toString: () => 'id2' },
      name: 'Pizzaria Central',
      location: { type: 'Point', coordinates: [-46.65, -23.6] },
      city: 'São Paulo',
    };

    const app = buildApp(buildMockDb([mockDoc]));
    const res = await request(app)
      .get('/v1/restaurants/search')
      .query({ ...VALID_VIEWPORT, q: 'pizza' });

    expect(res.status).toBe(200);
  });

  it('accepts optional cuisine filter', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app)
      .get('/v1/restaurants/search')
      .query({ ...VALID_VIEWPORT, cuisine: 'italiana' });

    expect(res.status).toBe(200);
  });

  it('accepts optional priceRange filter', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app)
      .get('/v1/restaurants/search')
      .query({ ...VALID_VIEWPORT, priceRange: '2' });

    expect(res.status).toBe(200);
  });
});

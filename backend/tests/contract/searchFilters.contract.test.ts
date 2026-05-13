/**
 * Contract tests for cuisine and priceRange filter params
 * GET /v1/restaurants/search with US4 filter parameters
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

const BASE_VIEWPORT = {
  neLat: '-23.5',
  neLng: '-46.6',
  swLat: '-23.7',
  swLng: '-46.8',
};

describe('Contract: cuisine and priceRange filter params', () => {
  it('accepts cuisine filter and returns 200', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app)
      .get('/v1/restaurants/search')
      .query({ ...BASE_VIEWPORT, cuisine: 'italiana' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('results');
  });

  it('accepts priceRange=1 and returns 200', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app)
      .get('/v1/restaurants/search')
      .query({ ...BASE_VIEWPORT, priceRange: '1' });

    expect(res.status).toBe(200);
  });

  it('accepts priceRange=4 (maximum) and returns 200', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app)
      .get('/v1/restaurants/search')
      .query({ ...BASE_VIEWPORT, priceRange: '4' });

    expect(res.status).toBe(200);
  });

  it('rejects priceRange=0 (below minimum)', async () => {
    const app = buildApp(buildMockDb());
    const res = await request(app)
      .get('/v1/restaurants/search')
      .query({ ...BASE_VIEWPORT, priceRange: '0' });

    expect(res.status).toBe(400);
  });

  it('rejects priceRange=5 (above maximum)', async () => {
    const app = buildApp(buildMockDb());
    const res = await request(app)
      .get('/v1/restaurants/search')
      .query({ ...BASE_VIEWPORT, priceRange: '5' });

    expect(res.status).toBe(400);
  });

  it('accepts combined cuisine + priceRange + text query', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app).get('/v1/restaurants/search').query({
      ...BASE_VIEWPORT,
      q: 'pizza',
      cuisine: 'italiana',
      priceRange: '2',
    });

    expect(res.status).toBe(200);
  });
});

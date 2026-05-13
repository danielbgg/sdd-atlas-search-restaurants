/**
 * Contract tests for GET /v1/restaurants/autocomplete
 * Validates that the API adheres to the OpenAPI contract.
 */

import request from 'supertest';
import express from 'express';
import { createAutocompleteRouter } from '../../src/api/routes/autocompleteRoutes';
import { errorHandler } from '../../src/api/middleware/errorHandler';
import type { Db, Collection } from 'mongodb';

function buildMockDb(suggestions: unknown[] = []): Db {
  const mockCollection = {
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(suggestions),
    }),
  } as unknown as Collection;

  return {
    collection: jest.fn().mockReturnValue(mockCollection),
  } as unknown as Db;
}

function buildApp(db: Db): express.Application {
  const app = express();
  app.use(express.json());
  app.use('/v1/restaurants/autocomplete', createAutocompleteRouter(db));
  app.use(errorHandler);
  return app;
}

describe('Contract: GET /v1/restaurants/autocomplete', () => {
  it('returns 200 with suggestions array for valid q', async () => {
    const mockSuggestion = {
      _id: { toString: () => 'id1' },
      name: 'Pizzaria Central',
    };

    const app = buildApp(buildMockDb([mockSuggestion]));
    const res = await request(app).get('/v1/restaurants/autocomplete').query({ q: 'pizz' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('suggestions');
    expect(Array.isArray(res.body.suggestions)).toBe(true);
  });

  it('returns 400 when q is missing', async () => {
    const app = buildApp(buildMockDb());
    const res = await request(app).get('/v1/restaurants/autocomplete').query({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 when q is empty string', async () => {
    const app = buildApp(buildMockDb());
    const res = await request(app).get('/v1/restaurants/autocomplete').query({ q: '' });

    expect(res.status).toBe(400);
  });

  it('suggestion items have required fields: id and name', async () => {
    const mockSuggestion = {
      _id: { toString: () => 'id42' },
      name: 'Sabor do Chef 1',
    };

    const app = buildApp(buildMockDb([mockSuggestion]));
    const res = await request(app).get('/v1/restaurants/autocomplete').query({ q: 'sabor' });

    expect(res.status).toBe(200);
    const item = res.body.suggestions[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
  });

  it('returns empty suggestions array when nothing matches', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app).get('/v1/restaurants/autocomplete').query({ q: 'xyz' });

    expect(res.status).toBe(200);
    expect(res.body.suggestions).toHaveLength(0);
  });

  it('respects optional limit parameter', async () => {
    const app = buildApp(buildMockDb([]));
    const res = await request(app)
      .get('/v1/restaurants/autocomplete')
      .query({ q: 'sushi', limit: '5' });

    expect(res.status).toBe(200);
  });

  it('rejects limit above 20', async () => {
    const app = buildApp(buildMockDb());
    const res = await request(app)
      .get('/v1/restaurants/autocomplete')
      .query({ q: 'sushi', limit: '25' });

    expect(res.status).toBe(400);
  });
});

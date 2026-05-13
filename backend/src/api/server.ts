import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { connectToMongoDB, healthCheck } from '../config/mongodb';
import { createSearchRouter } from './routes/searchRoutes';
import { createAutocompleteRouter } from './routes/autocompleteRoutes';
import { createFacetsRouter } from './routes/facetsRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { performanceLogger } from './middleware/performanceLogger';

export async function createApp(): Promise<express.Application> {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(performanceLogger);

  const db = await connectToMongoDB();

  app.get('/v1/health', async (_req, res) => {
    const healthy = await healthCheck();
    if (healthy) {
      res.json({ status: 'ok' });
    } else {
      res.status(503).json({ status: 'error', message: 'Database unreachable' });
    }
  });

  app.use('/v1/restaurants/search', createSearchRouter(db));
  app.use('/v1/restaurants/autocomplete', createAutocompleteRouter(db));
  app.use('/v1/restaurants/facets', createFacetsRouter(db));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT ?? 3001;
  createApp()
    .then((app) => {
      app.listen(PORT, () => {
        console.info(`✓ Server listening on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}

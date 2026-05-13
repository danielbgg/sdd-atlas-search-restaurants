import { Router, Request, Response, NextFunction } from 'express';
import { Db } from 'mongodb';
import { RestaurantSearchService } from '../../services/restaurantSearchService.js';
import { SearchQuerySchema } from '../../validation/search.js';

export function createSearchRouter(db: Db): Router {
  const router = Router();
  const service = new RestaurantSearchService(db);

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = SearchQuerySchema.parse(req.query);
      const result = await service.search(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

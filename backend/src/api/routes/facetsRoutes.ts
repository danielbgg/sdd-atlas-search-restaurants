import { Router, Request, Response, NextFunction } from 'express';
import { Db } from 'mongodb';
import { FacetsService } from '../../services/facetsService';
import { FacetsQuerySchema } from '../../validation/search';

export function createFacetsRouter(db: Db): Router {
  const router = Router();
  const service = new FacetsService(db);

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = FacetsQuerySchema.parse(req.query);
      const result = await service.facets(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

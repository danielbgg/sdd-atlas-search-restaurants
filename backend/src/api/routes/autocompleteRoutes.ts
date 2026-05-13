import { Router, Request, Response, NextFunction } from 'express';
import { Db } from 'mongodb';
import { AutocompleteService } from '../../services/autocompleteService.js';
import { AutocompleteQuerySchema } from '../../validation/search.js';

export function createAutocompleteRouter(db: Db): Router {
  const router = Router();
  const service = new AutocompleteService(db);

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = AutocompleteQuerySchema.parse(req.query);
      const result = await service.suggest(query);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

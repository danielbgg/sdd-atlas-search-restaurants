import { Db } from 'mongodb';
import { RestaurantRepository } from '../repositories/restaurantRepository';
import type { FacetsQuery } from '../validation/search';
import type { FacetsResponse } from '../models/restaurant';

export class FacetsService {
  private repo: RestaurantRepository;

  constructor(db: Db) {
    this.repo = new RestaurantRepository(db);
  }

  async facets(query: FacetsQuery): Promise<FacetsResponse> {
    return this.repo.getFacets(query);
  }
}

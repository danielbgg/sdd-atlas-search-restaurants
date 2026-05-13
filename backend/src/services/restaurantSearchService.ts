import { Db } from 'mongodb';
import { RestaurantRepository } from '../repositories/restaurantRepository';
import type { SearchQuery } from '../validation/search';
import type { SearchResponse } from '../models/restaurant';

export class RestaurantSearchService {
  private repo: RestaurantRepository;

  constructor(db: Db) {
    this.repo = new RestaurantRepository(db);
  }

  async search(query: SearchQuery): Promise<SearchResponse> {
    const results = await this.repo.findByViewport(query);
    return {
      total: results.length,
      results,
    };
  }
}

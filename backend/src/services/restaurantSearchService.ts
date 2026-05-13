import { Db } from 'mongodb';
import { RestaurantRepository } from '../repositories/restaurantRepository.js';
import type { SearchQuery } from '../validation/search.js';
import type { SearchResponse } from '../models/restaurant.js';

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

import { Db } from 'mongodb';
import { RestaurantRepository } from '../repositories/restaurantRepository';
import type { AutocompleteQuery } from '../validation/search';
import type { AutocompleteResponse } from '../models/restaurant';

export class AutocompleteService {
  private repo: RestaurantRepository;

  constructor(db: Db) {
    this.repo = new RestaurantRepository(db);
  }

  async suggest(query: AutocompleteQuery): Promise<AutocompleteResponse> {
    const normalizedQuery: AutocompleteQuery = {
      ...query,
      q: query.q.trim().toLowerCase(),
    };

    const suggestions = await this.repo.autocomplete(normalizedQuery);
    return { suggestions };
  }
}

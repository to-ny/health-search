/**
 * Storage service abstraction
 * Enables future migration from localStorage to API-backed storage
 */

export interface UserPreferences {
  language: 'en' | 'nl' | 'fr' | 'de';
  theme: 'light' | 'dark' | 'system';
  excludedIngredients: string[];
}

export interface RecentSearch {
  query: string;
  type: 'name' | 'cnk' | 'ingredient';
  timestamp: number;
}

/**
 * Storage service interface
 * Initial implementation uses localStorage
 * Can be swapped for API-backed implementation for user accounts
 */
export interface IStorageService {
  // Favorites
  getFavorites(): Promise<string[]>;
  addFavorite(cnk: string): Promise<void>;
  removeFavorite(cnk: string): Promise<void>;
  isFavorite(cnk: string): Promise<boolean>;

  // Recent searches
  getRecentSearches(): Promise<RecentSearch[]>;
  addRecentSearch(search: Omit<RecentSearch, 'timestamp'>): Promise<void>;
  clearRecentSearches(): Promise<void>;

  // Preferences
  getPreferences(): Promise<UserPreferences>;
  setPreferences(prefs: Partial<UserPreferences>): Promise<void>;

  // Excluded ingredients (for allergen filtering)
  getExcludedIngredients(): Promise<string[]>;
  addExcludedIngredient(ingredient: string): Promise<void>;
  removeExcludedIngredient(ingredient: string): Promise<void>;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'en',
  theme: 'system',
  excludedIngredients: [],
};

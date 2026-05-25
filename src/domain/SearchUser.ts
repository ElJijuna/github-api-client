import type { PaginationParams } from './Pagination';

/**
 * Query parameters for searching users.
 *
 * @see {@link https://docs.github.com/en/rest/search/search#search-users}
 */
export interface SearchUsersParams extends PaginationParams {
  /** The search query string. Required. Supports qualifiers like `type:user`, `language:typescript`, `location:Berlin`. */
  q: string;
  /** Sort field */
  sort?: 'followers' | 'repositories' | 'joined';
  /** Sort direction */
  order?: 'asc' | 'desc';
}

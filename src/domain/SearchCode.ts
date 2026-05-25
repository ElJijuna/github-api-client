import type { PaginationParams } from './Pagination';
import type { GitHubRepository } from './Repository';

/**
 * Query parameters for searching code.
 *
 * @see {@link https://docs.github.com/en/rest/search/search#search-code}
 */
export interface SearchCodeParams extends PaginationParams {
  /** The search query string. Required. Supports qualifiers like `repo:`, `path:`, `language:`, `extension:`. */
  q: string;
  /** Sort field (only `'indexed'` is supported) */
  sort?: 'indexed';
  /** Sort direction */
  order?: 'asc' | 'desc';
}

/**
 * Represents a code search result item.
 *
 * @see {@link https://docs.github.com/en/rest/search/search#search-code}
 */
export interface GitHubCodeResult {
  /** Filename */
  name: string;
  /** Full path within the repository */
  path: string;
  /** Blob SHA */
  sha: string;
  /** API URL for this blob */
  url: string;
  /** URL to view the file on GitHub */
  html_url: string;
  /** Repository the file belongs to */
  repository: GitHubRepository;
}

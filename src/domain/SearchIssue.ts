import type { PaginationParams } from './Pagination';

/**
 * Query parameters for searching issues and pull requests.
 *
 * Use the `q` field to build a GitHub search query.
 * Prefix qualifiers with `is:issue` or `is:pr` to narrow results.
 *
 * @example
 * ```typescript
 * // All open PRs authored by a user
 * { q: 'is:pr is:open author:octocat' }
 *
 * // Stale issues not updated in 30+ days
 * { q: 'is:issue is:open updated:<2024-01-01' }
 * ```
 *
 * @see {@link https://docs.github.com/en/rest/search/search#search-issues-and-pull-requests}
 */
export interface SearchIssuesParams extends PaginationParams {
  /**
   * The search query string. Required.
   *
   * Supports GitHub's search syntax with qualifiers such as
   * `is:issue`, `is:pr`, `is:open`, `author:`, `label:`, `repo:`, etc.
   */
  q: string;
  /** Sort field */
  sort?: 'created' | 'updated' | 'comments';
  /** Sort direction */
  order?: 'asc' | 'desc';
}

/**
 * Common pagination parameters accepted by GitHub REST API list endpoints.
 *
 * GitHub uses page-based pagination. Pass `page` and `per_page` to control results.
 */
export interface PaginationParams {
  /**
   * Maximum number of results per page.
   * GitHub default is `30`, maximum is `100`.
   */
  per_page?: number;
  /**
   * Page number to retrieve (1-based).
   * Use `nextPage` from the previous response to paginate forward.
   */
  page?: number;
}

/**
 * Wrapper returned by GitHub paginated list endpoints.
 *
 * Use `values` for the items, `hasNextPage` and `nextPage` for pagination.
 *
 * @example
 * ```typescript
 * let page = 1;
 * let hasMore = true;
 * while (hasMore) {
 *   const res = await gh.user('octocat').repos({ per_page: 100, page });
 *   process(res.values);
 *   hasMore = res.hasNextPage;
 *   page = res.nextPage ?? page + 1;
 * }
 * ```
 */
export interface GitHubPagedResponse<T> {
  /** The items on the current page */
  values: T[];
  /** Whether there are more pages available */
  hasNextPage: boolean;
  /** The next page number, if `hasNextPage` is true */
  nextPage?: number;
  /** Total number of results (only available for search endpoints) */
  totalCount?: number;
}

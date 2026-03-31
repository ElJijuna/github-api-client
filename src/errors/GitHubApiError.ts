/**
 * Thrown when the GitHub REST API returns a non-2xx response.
 *
 * @example
 * ```typescript
 * import { GitHubApiError } from 'github-api-client';
 *
 * try {
 *   await gh.user('nonexistent-user-xyz');
 * } catch (err) {
 *   if (err instanceof GitHubApiError) {
 *     console.log(err.status);     // 404
 *     console.log(err.statusText); // 'Not Found'
 *     console.log(err.message);    // 'GitHub API error: 404 Not Found'
 *   }
 * }
 * ```
 */
export class GitHubApiError extends Error {
  /** HTTP status code (e.g. `404`, `401`, `403`, `422`) */
  readonly status: number;
  /** HTTP status text (e.g. `'Not Found'`, `'Unauthorized'`) */
  readonly statusText: string;

  constructor(status: number, statusText: string) {
    super(`GitHub API error: ${status} ${statusText}`);
    this.name = 'GitHubApiError';
    this.status = status;
    this.statusText = statusText;
  }
}

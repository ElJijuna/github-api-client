/**
 * Handles Bearer token authentication for GitHub REST API requests.
 *
 * @example
 * ```typescript
 * const security = new Security('ghp_myPersonalAccessToken');
 *
 * const headers = security.getHeaders();
 * // {
 * //   Authorization: 'Bearer ghp_myPersonalAccessToken',
 * //   Accept: 'application/vnd.github+json',
 * //   'Content-Type': 'application/json',
 * //   'X-GitHub-Api-Version': '2022-11-28',
 * // }
 * ```
 */
export class Security {
  private readonly apiUrl: string;
  private readonly token: string;

  /**
   * Creates a new Security instance with a GitHub personal access token.
   *
   * @param token - A GitHub personal access token (e.g., `ghp_...`) or OAuth token
   * @param apiUrl - The base URL of the GitHub API. Defaults to `'https://api.github.com'`.
   *   Must be a valid URL; throws if it cannot be parsed.
   *
   * @throws {TypeError} If `apiUrl` is not a valid URL
   */
  constructor(token: string, apiUrl: string = 'https://api.github.com') {
    if (!URL.canParse(apiUrl)) {
      throw new TypeError(`Invalid apiUrl: "${apiUrl}" is not a valid URL`);
    }
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.token = token;
  }

  /**
   * Returns the base URL of the GitHub API, without a trailing slash.
   *
   * @returns The API base URL
   */
  getApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Returns the value of the `Authorization` header for Bearer authentication.
   *
   * @returns The Authorization header value in the format `Bearer <token>`
   */
  getAuthorizationHeader(): string {
    return `Bearer ${this.token}`;
  }

  /**
   * Returns the full set of HTTP headers required for authenticated GitHub API requests.
   *
   * @returns An object containing `Authorization`, `Accept`, `Content-Type`, and `X-GitHub-Api-Version` headers
   */
  getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  /**
   * Returns headers for raw file content requests.
   *
   * @returns Headers with `Accept: application/vnd.github.raw+json`
   */
  getRawHeaders(): Record<string, string> {
    return {
      ...this.getHeaders(),
      Accept: 'application/vnd.github.raw+json',
    };
  }
}

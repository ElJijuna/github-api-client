import { Security } from './security/Security';
import { GitHubApiError } from './errors/GitHubApiError';
import { OrganizationResource } from './resources/OrganizationResource';
import type { RequestFn, RequestListFn, RequestTextFn, RequestBodyFn, RequestPatchFn, RequestDeleteFn, RequestPutFn, RequestBodyPutFn, GraphQLFn } from './resources/OrganizationResource';
import { RepositoryResource } from './resources/RepositoryResource';
import { UserResource } from './resources/UserResource';
import { GistResource } from './resources/GistResource';
import type { GitHubUser } from './domain/User';
import type { GitHubRepository, SearchReposParams } from './domain/Repository';
import type { GitHubGist, GistsParams, CreateGistData } from './domain/Gist';
import type { GitHubAdvisory, AdvisoriesParams } from './domain/Advisory';
import type { GitHubPagedResponse } from './domain/Pagination';
import type { GitHubIssue, IssuesParams } from './domain/Issue';
import type { GitHubNotification, NotificationsParams } from './domain/Notification';
import type { SearchIssuesParams } from './domain/SearchIssue';
import type { SearchUsersParams } from './domain/User';
import type { SearchCodeParams, GitHubCodeResult } from './domain/SearchCode';

/**
 * Payload emitted on every HTTP request made by {@link GitHubClient}.
 */
export interface RequestEvent {
  /** Full URL that was requested */
  url: string;
  /** HTTP method used */
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  /** Timestamp when the request started */
  startedAt: Date;
  /** Timestamp when the request finished (success or error) */
  finishedAt: Date;
  /** Total duration in milliseconds */
  durationMs: number;
  /** HTTP status code returned by the server, if a response was received */
  statusCode?: number;
  /** Error thrown, if the request failed */
  error?: Error;
}

/** Map of supported client events to their callback signatures */
export interface GitHubClientEvents {
  request: (event: RequestEvent) => void;
}

/**
 * Constructor options for {@link GitHubClient}.
 */
export interface GitHubClientOptions {
  /** A GitHub personal access token (`ghp_...`), OAuth token, or GitHub App installation token */
  token?: string;
  /**
   * The base URL of the GitHub API.
   * Defaults to `'https://api.github.com'`.
   * Override for GitHub Enterprise Server (e.g., `'https://github.mycompany.com/api/v3'`).
   */
  apiUrl?: string;
}

/**
 * GitHub REST API search result envelope.
 * @internal
 */
interface SearchResult<T> {
  total_count: number;
  incomplete_results: boolean;
  items: T[];
}

/**
 * Main entry point for the GitHub REST API client.
 *
 * @example
 * ```typescript
 * const gh = new GitHubClient({ token: 'ghp_myPersonalAccessToken' });
 *
 * const me       = await gh.currentUser();
 * const user     = await gh.user('octocat');
 * const repos    = await gh.user('octocat').repos({ sort: 'updated' });
 * const org      = await gh.org('github');
 * const repo     = await gh.repo('octocat', 'Hello-World');
 * const prs      = await gh.repo('octocat', 'Hello-World').pullRequests({ state: 'open' });
 * const commits  = await gh.repo('octocat', 'Hello-World').commits({ per_page: 10 });
 * const results  = await gh.searchRepos({ q: 'language:typescript stars:>1000' });
 * ```
 */
export class GitHubClient {
  private readonly security: Security;
  private readonly requestListeners: GitHubClientEvents['request'][] = [];
  private readonly requestFn: RequestFn = <T>(
    path: string,
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => this.request<T>(path, params, { signal });
  private readonly requestListFn: RequestListFn = <T>(
    path: string,
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => this.requestList<T>(path, params, signal);
  private readonly requestTextFn: RequestTextFn = (
    path: string,
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ) => this.requestText(path, params, signal);
  private readonly requestBodyFn: RequestBodyFn = <T>(
    path: string,
    body: unknown,
    signal?: AbortSignal,
  ) => this.requestPost<T>(path, body, signal);
  private readonly requestPatchFn: RequestPatchFn = <T>(
    path: string,
    body: unknown,
    signal?: AbortSignal,
  ) => this.requestPatch<T>(path, body, signal);
  private readonly requestDeleteFn: RequestDeleteFn = (path: string, signal?: AbortSignal) =>
    this.requestDelete(path, signal);
  private readonly requestPutFn: RequestPutFn = (path: string, signal?: AbortSignal) =>
    this.requestPut(path, signal);
  private readonly requestBodyPutFn: RequestBodyPutFn = <T>(
    path: string,
    body: unknown,
    signal?: AbortSignal,
  ) => this.requestBodyPut<T>(path, body, signal);
  private readonly graphQLFn: GraphQLFn = <T>(
    query: string,
    variables?: Record<string, unknown>,
    signal?: AbortSignal,
  ) => this.requestGraphQL<T>(query, variables, signal);

  /**
   * @param options - Authentication and connection options
   * @throws {TypeError} If `apiUrl` is not a valid URL
   */
  constructor({ token, apiUrl }: GitHubClientOptions = {}) {
    this.security = new Security(token, apiUrl);
  }

  /**
   * Subscribes to a client event.
   *
   * @example
   * ```typescript
   * gh.on('request', (event) => {
   *   console.log(`${event.method} ${event.url} — ${event.durationMs}ms`);
   *   if (event.error) console.error('Request failed:', event.error);
   * });
   * ```
   */
  on<K extends keyof GitHubClientEvents>(event: K, callback: GitHubClientEvents[K]): this {
    if (event === 'request') {
      this.requestListeners.push(callback as GitHubClientEvents['request']);
    }
    return this;
  }

  private startRequestEvent(): Date | undefined {
    return this.requestListeners.length > 0 ? new Date() : undefined;
  }

  private emitRequestEvent(
    method: RequestEvent['method'],
    url: string,
    startedAt: Date | undefined,
    statusCode?: number,
    error?: Error,
  ): void {
    if (!startedAt) return;
    const finishedAt = new Date();
    const payload: RequestEvent = {
      url,
      method,
      startedAt,
      finishedAt,
      durationMs: finishedAt.getTime() - startedAt.getTime(),
      statusCode,
      ...(error ? { error } : {}),
    };
    for (const listener of this.requestListeners) {
      listener(payload);
    }
  }

  /**
   * Performs an authenticated GET request returning a single JSON object.
   * @internal
   */
  private async request<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
    options?: { headers?: Record<string, string>; signal?: AbortSignal },
  ): Promise<T> {
    const base = `${this.security.getApiUrl()}${path}`;
    const url = buildUrl(base, params);
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const headers = options?.headers ?? this.security.getHeaders();
      const response = await fetch(url, { headers, signal: options?.signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = await response.json() as T;
      this.emitRequestEvent('GET', url, startedAt, statusCode);
      return data;
    } catch (err) {
      this.emitRequestEvent('GET', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Performs an authenticated GET request returning a paginated list.
   * Parses the `Link` response header to determine if more pages exist.
   * @internal
   */
  private async requestList<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ): Promise<GitHubPagedResponse<T>> {
    const base = `${this.security.getApiUrl()}${path}`;
    const url = buildUrl(base, params);
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getHeaders(), signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = await response.json() as T[];
      const linkHeader = response.headers.get('Link');
      const nextPage = parseNextPage(linkHeader);
      this.emitRequestEvent('GET', url, startedAt, statusCode);
      return {
        values: data,
        hasNextPage: nextPage !== undefined,
        nextPage,
      };
    } catch (err) {
      this.emitRequestEvent('GET', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Performs a GET request returning raw text content.
   * Uses `Accept: application/vnd.github.raw+json` to retrieve file content directly.
   * @internal
   */
  private async requestText(
    path: string,
    params?: Record<string, string | number | boolean>,
    signal?: AbortSignal,
  ): Promise<string> {
    const base = `${this.security.getApiUrl()}${path}`;
    const url = buildUrl(base, params);
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getRawHeaders(), signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const text = await response.text();
      this.emitRequestEvent('GET', url, startedAt, statusCode);
      return text;
    } catch (err) {
      this.emitRequestEvent('GET', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private makeRequestFn(): RequestFn {
    return this.requestFn;
  }

  private makeRequestListFn(): RequestListFn {
    return this.requestListFn;
  }

  private makeRequestTextFn(): RequestTextFn {
    return this.requestTextFn;
  }

  private async requestPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.security.getHeaders(),
        body: JSON.stringify(body),
        signal,
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = response.status !== 204 ? await response.json() as T : undefined as unknown as T;
      this.emitRequestEvent('POST', url, startedAt, statusCode);
      return data;
    } catch (err) {
      this.emitRequestEvent('POST', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private makeRequestBodyFn(): RequestBodyFn {
    return this.requestBodyFn;
  }

  private async requestPatch<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.security.getHeaders(),
        body: JSON.stringify(body),
        signal,
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = await response.json() as T;
      this.emitRequestEvent('PATCH', url, startedAt, statusCode);
      return data;
    } catch (err) {
      this.emitRequestEvent('PATCH', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private async requestDelete(path: string, signal?: AbortSignal): Promise<void> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: this.security.getHeaders(),
        signal,
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      this.emitRequestEvent('DELETE', url, startedAt, statusCode);
    } catch (err) {
      this.emitRequestEvent('DELETE', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private makeRequestPatchFn(): RequestPatchFn {
    return this.requestPatchFn;
  }

  private makeRequestDeleteFn(): RequestDeleteFn {
    return this.requestDeleteFn;
  }

  private async requestPut(path: string, signal?: AbortSignal): Promise<void> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.security.getHeaders(),
        signal,
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      this.emitRequestEvent('PUT', url, startedAt, statusCode);
    } catch (err) {
      this.emitRequestEvent('PUT', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private makeRequestPutFn(): RequestPutFn {
    return this.requestPutFn;
  }

  private async requestBodyPut<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.security.getHeaders(),
        body: JSON.stringify(body),
        signal,
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = response.status !== 204 ? await response.json() as T : undefined as unknown as T;
      this.emitRequestEvent('PUT', url, startedAt, statusCode);
      return data;
    } catch (err) {
      this.emitRequestEvent('PUT', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private makeRequestBodyPutFn(): RequestBodyPutFn {
    return this.requestBodyPutFn;
  }

  private async requestGraphQL<T>(query: string, variables?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    const url = `${this.security.getApiUrl()}/graphql`;
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.security.getHeaders(),
        body: JSON.stringify({ query, variables }),
        signal,
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const json = await response.json() as { data?: T; errors?: Array<{ message: string }> };
      if (json.errors?.length) {
        throw new Error(json.errors.map(e => e.message).join('; '));
      }
      this.emitRequestEvent('POST', url, startedAt, statusCode);
      return json.data as T;
    } catch (err) {
      this.emitRequestEvent('POST', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  private makeGraphQLFn(): GraphQLFn {
    return this.graphQLFn;
  }

  /**
   * Executes an arbitrary GitHub GraphQL query.
   *
   * `POST https://api.github.com/graphql`
   *
   * @param query - The GraphQL query string
   * @param variables - Optional query variables
   * @param signal - Optional AbortSignal
   * @returns The `data` field of the GraphQL response
   * @throws {Error} If the response contains GraphQL errors
   * @throws {GitHubApiError} If the HTTP request fails
   *
   * @example
   * ```typescript
   * const result = await gh.graphql<{ viewer: { login: string } }>(`
   *   query { viewer { login } }
   * `);
   * console.log(result.viewer.login);
   * ```
   */
  async graphql<T>(query: string, variables?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
    return this.requestGraphQL<T>(query, variables, signal);
  }

  /**
   * Fetches the authenticated user's profile.
   *
   * `GET /user`
   *
   * @returns The authenticated user object
   *
   * @example
   * ```typescript
   * const me = await gh.currentUser();
   * console.log(me.login); // 'octocat'
   * ```
   */
  async currentUser(signal?: AbortSignal): Promise<GitHubUser> {
    return this.request<GitHubUser>('/user', undefined, { signal });
  }

  /**
   * Returns a {@link UserResource} for a given GitHub login, providing access
   * to user data and their repositories.
   *
   * The returned resource can be awaited directly to fetch user info,
   * or chained to access nested resources.
   *
   * @param login - The user's login name (e.g., `'octocat'`)
   * @returns A chainable user resource
   *
   * @example
   * ```typescript
   * const user  = await gh.user('octocat');
   * const repos = await gh.user('octocat').repos({ sort: 'updated' });
   * const pr    = await gh.user('octocat').repo('Hello-World').pullRequest(1).files();
   * ```
   */
  user(login: string): UserResource {
    return new UserResource(
      this.makeRequestFn(),
      this.makeRequestListFn(),
      this.makeRequestTextFn(),
      this.makeRequestBodyFn(),
      this.makeRequestPatchFn(),
      this.makeRequestDeleteFn(),
      this.makeRequestBodyPutFn(),
      this.makeGraphQLFn(),
      login,
    );
  }

  /**
   * Returns an {@link OrganizationResource} for a given GitHub organization, providing
   * access to organization data and its repositories.
   *
   * The returned resource can be awaited directly to fetch organization info,
   * or chained to access nested resources.
   *
   * @param name - The organization's login name (e.g., `'github'`)
   * @returns A chainable organization resource
   *
   * @example
   * ```typescript
   * const org   = await gh.org('github');
   * const repos = await gh.org('github').repos({ type: 'public' });
   * const prs   = await gh.org('github').repo('linguist').pullRequests({ state: 'open' });
   * ```
   */
  org(name: string): OrganizationResource {
    return new OrganizationResource(
      this.makeRequestFn(),
      this.makeRequestListFn(),
      this.makeRequestTextFn(),
      this.makeRequestBodyFn(),
      this.makeRequestPatchFn(),
      this.makeRequestDeleteFn(),
      this.makeRequestBodyPutFn(),
      name,
    );
  }

  /**
   * Returns a {@link RepositoryResource} for a given owner and repository name.
   *
   * Shortcut that works for both user repositories and organization repositories.
   *
   * @param owner - The owner login (user or organization)
   * @param name - The repository name
   * @returns A chainable repository resource
   *
   * @example
   * ```typescript
   * const repo  = await gh.repo('octocat', 'Hello-World');
   * const prs   = await gh.repo('octocat', 'Hello-World').pullRequests();
   * ```
   */
  repo(owner: string, name: string): RepositoryResource {
    return new RepositoryResource(
      this.makeRequestFn(),
      this.makeRequestListFn(),
      this.makeRequestTextFn(),
      this.makeRequestBodyFn(),
      this.makeRequestPatchFn(),
      this.makeRequestDeleteFn(),
      this.makeRequestBodyPutFn(),
      owner,
      name,
    );
  }

  /**
   * Searches for repositories using GitHub's search syntax.
   *
   * `GET /search/repositories`
   *
   * @param params - Search query and optional filters. `q` is required.
   * @returns A paged response of repositories with `totalCount`
   *
   * @example
   * ```typescript
   * const results = await gh.searchRepos({ q: 'language:typescript stars:>1000', sort: 'stars' });
   * console.log(`Found ${results.totalCount} repositories`);
   * ```
   */
  async searchRepos(params: SearchReposParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubRepository>> {
    const base = `${this.security.getApiUrl()}/search/repositories`;
    const url = buildUrl(base, params as unknown as Record<string, string | number | boolean>);
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getHeaders(), signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = await response.json() as SearchResult<GitHubRepository>;
      const linkHeader = response.headers.get('Link');
      const nextPage = parseNextPage(linkHeader);
      this.emitRequestEvent('GET', url, startedAt, statusCode);
      return {
        values: data.items,
        hasNextPage: nextPage !== undefined,
        nextPage,
        totalCount: data.total_count,
      };
    } catch (err) {
      this.emitRequestEvent('GET', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Returns a {@link GistResource} for a given gist ID.
   *
   * The returned resource can be awaited directly to fetch the gist,
   * or chained to access nested resources (comments, forks, star).
   *
   * @param gistId - The gist ID
   * @returns A chainable gist resource
   *
   * @example
   * ```typescript
   * const gist     = await gh.gist('abc123');
   * const comments = await gh.gist('abc123').comments();
   * await gh.gist('abc123').star();
   * ```
   */
  gist(gistId: string): GistResource {
    return new GistResource(
      this.makeRequestFn(),
      this.makeRequestListFn(),
      this.makeRequestBodyFn(),
      this.makeRequestPatchFn(),
      this.makeRequestDeleteFn(),
      this.makeRequestPutFn(),
      gistId,
    );
  }

  /**
   * Lists gists for the authenticated user (or publicly if unauthenticated).
   *
   * `GET /gists`
   *
   * @param params - Optional filters: `since`, `per_page`, `page`
   */
  async listGists(params?: GistsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubGist>> {
    return this.requestList<GitHubGist>('/gists', params as Record<string, string | number | boolean>, signal);
  }

  /**
   * Creates a new gist.
   *
   * `POST /gists`
   *
   * @param data - Gist files and optional description/visibility
   */
  async createGist(data: CreateGistData, signal?: AbortSignal): Promise<GitHubGist> {
    return this.requestPost<GitHubGist>('/gists', data, signal);
  }

  /**
   * Lists global security advisories from the GitHub Advisory Database.
   *
   * `GET /advisories`
   *
   * @param params - Optional filters: `ghsa_id`, `cve_id`, `ecosystem`, `severity`, `cwe_id`, `is_withdrawn`, `sort`, `direction`, `per_page`, `page`
   * @returns A paged response of global advisories
   *
   * @example
   * ```typescript
   * const advisories = await gh.advisories({ severity: 'critical', ecosystem: 'npm' });
   * ```
   */
  async advisories(params?: AdvisoriesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubAdvisory>> {
    return this.requestList<GitHubAdvisory>('/advisories', params as Record<string, string | number | boolean>, signal);
  }

  /**
   * Fetches a single global security advisory by its GHSA ID.
   *
   * `GET /advisories/{ghsa_id}`
   *
   * @param ghsaId - The GHSA identifier (e.g., `'GHSA-xxxx-xxxx-xxxx'`)
   * @returns The advisory object
   *
   * @example
   * ```typescript
   * const advisory = await gh.advisory('GHSA-1234-5678-9abc');
   * ```
   */
  async advisory(ghsaId: string, signal?: AbortSignal): Promise<GitHubAdvisory> {
    return this.request<GitHubAdvisory>(`/advisories/${ghsaId}`, undefined, { signal });
  }

  /**
   * Fetches a global security advisory by its CVE ID.
   *
   * `GET /advisories?cve_id={cveId}`
   *
   * @param cveId - The CVE identifier (e.g., `'CVE-2021-44228'`)
   * @returns The advisory object, or `null` if no advisory is found for the given CVE ID
   *
   * @example
   * ```typescript
   * const advisory = await gh.advisoryByCve('CVE-2021-44228');
   * if (advisory) console.log(advisory.summary);
   * ```
   */
  async advisoryByCve(cveId: string, signal?: AbortSignal): Promise<GitHubAdvisory | null> {
    const result = await this.requestList<GitHubAdvisory>('/advisories', { cve_id: cveId }, signal);
    return result.values[0] ?? null;
  }

  /**
   * Performs a PATCH request that returns 205 No Content (no response body).
   * Used for endpoints like marking a notification thread as read.
   * @internal
   */
  private async requestPatchVoid(path: string, signal?: AbortSignal): Promise<void> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: this.security.getHeaders(),
        signal,
      });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      this.emitRequestEvent('PATCH', url, startedAt, statusCode);
    } catch (err) {
      this.emitRequestEvent('PATCH', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Lists notifications for the authenticated user.
   *
   * `GET /notifications`
   *
   * @param params - Optional filters: `all`, `participating`, `since`, `before`, `per_page`, `page`
   * @returns A paged response of notification threads
   *
   * @example
   * ```typescript
   * // Only unread notifications
   * const { values } = await gh.notifications();
   *
   * // All notifications including already-read ones
   * const { values } = await gh.notifications({ all: true });
   * ```
   */
  async notifications(params?: NotificationsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubNotification>> {
    return this.requestList<GitHubNotification>('/notifications', params as Record<string, string | number | boolean>, signal);
  }

  /**
   * Marks a single notification thread as read.
   *
   * `PATCH /notifications/threads/{thread_id}`
   *
   * Returns `void` — GitHub responds with 205 No Content on success.
   *
   * @param threadId - The numeric thread ID (from `GitHubNotification.id`)
   *
   * @example
   * ```typescript
   * await gh.markNotificationRead('123456789');
   * ```
   */
  async markNotificationRead(threadId: string, signal?: AbortSignal): Promise<void> {
    return this.requestPatchVoid(`/notifications/threads/${threadId}`, signal);
  }

  /**
   * Marks all notifications as read.
   *
   * `PUT /notifications`
   *
   * Returns `void` — GitHub responds with 205 No Content on success.
   *
   * @example
   * ```typescript
   * await gh.markAllNotificationsRead();
   * ```
   */
  async markAllNotificationsRead(signal?: AbortSignal): Promise<void> {
    return this.requestPut('/notifications', signal);
  }

  /**
   * Lists issues assigned to the authenticated user across all repositories.
   *
   * `GET /issues`
   *
   * Note: GitHub returns pull requests as issues in this endpoint.
   * Filter them out by checking for the absence of `pull_request` on each item.
   *
   * @param params - Optional filters: `filter`, `state`, `labels`, `sort`, `direction`, `since`, `per_page`, `page`
   * @returns A paged response of issues
   *
   * @example
   * ```typescript
   * // All open issues across all repos the user has access to
   * const { values } = await gh.issues({ filter: 'all', state: 'open' });
   * const realIssues = values.filter(i => !i.pull_request);
   * ```
   */
  async issues(params?: IssuesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubIssue>> {
    return this.requestList<GitHubIssue>('/issues', params as Record<string, string | number | boolean>, signal);
  }

  /**
   * Searches for issues and pull requests using GitHub's search syntax.
   *
   * `GET /search/issues`
   *
   * @param params - Search query and optional sort/order. `q` is required.
   * @returns A paged response of issues/PRs with `totalCount`
   *
   * @example
   * ```typescript
   * // Open PRs authored by a user
   * const results = await gh.searchIssues({ q: 'is:pr is:open author:octocat' });
   * console.log(`Found ${results.totalCount} pull requests`);
   *
   * // Stale issues not updated in 30+ days
   * const stale = await gh.searchIssues({ q: 'is:issue is:open updated:<2024-01-01', sort: 'updated' });
   * ```
   */
  async searchIssues(params: SearchIssuesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubIssue>> {
    const base = `${this.security.getApiUrl()}/search/issues`;
    const url = buildUrl(base, params as unknown as Record<string, string | number | boolean>);
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getHeaders(), signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = await response.json() as SearchResult<GitHubIssue>;
      const linkHeader = response.headers.get('Link');
      const nextPage = parseNextPage(linkHeader);
      this.emitRequestEvent('GET', url, startedAt, statusCode);
      return {
        values: data.items,
        hasNextPage: nextPage !== undefined,
        nextPage,
        totalCount: data.total_count,
      };
    } catch (err) {
      this.emitRequestEvent('GET', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Searches for users using GitHub's search syntax.
   *
   * `GET /search/users`
   *
   * @param params - Search query and optional sort/order. `q` is required.
   * @returns A paged response of users with `totalCount`
   *
   * @example
   * ```typescript
   * const results = await gh.searchUsers({ q: 'location:Berlin language:typescript', sort: 'followers' });
   * console.log(`Found ${results.totalCount} users`);
   * ```
   */
  async searchUsers(params: SearchUsersParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubUser>> {
    const base = `${this.security.getApiUrl()}/search/users`;
    const url = buildUrl(base, params as unknown as Record<string, string | number | boolean>);
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getHeaders(), signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = await response.json() as SearchResult<GitHubUser>;
      const linkHeader = response.headers.get('Link');
      const nextPage = parseNextPage(linkHeader);
      this.emitRequestEvent('GET', url, startedAt, statusCode);
      return {
        values: data.items,
        hasNextPage: nextPage !== undefined,
        nextPage,
        totalCount: data.total_count,
      };
    } catch (err) {
      this.emitRequestEvent('GET', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }

  /**
   * Searches for code using GitHub's search syntax.
   *
   * `GET /search/code`
   *
   * @param params - Search query and optional sort/order. `q` is required.
   * @returns A paged response of code results with `totalCount`
   *
   * @example
   * ```typescript
   * const results = await gh.searchCode({ q: 'addClass repo:jquery/jquery' });
   * console.log(`Found ${results.totalCount} files`);
   * results.values; // GitHubCodeResult[]
   * ```
   */
  async searchCode(params: SearchCodeParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubCodeResult>> {
    const base = `${this.security.getApiUrl()}/search/code`;
    const url = buildUrl(base, params as unknown as Record<string, string | number | boolean>);
    const startedAt = this.startRequestEvent();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getHeaders(), signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = await response.json() as SearchResult<GitHubCodeResult>;
      const linkHeader = response.headers.get('Link');
      const nextPage = parseNextPage(linkHeader);
      this.emitRequestEvent('GET', url, startedAt, statusCode);
      return {
        values: data.items,
        hasNextPage: nextPage !== undefined,
        nextPage,
        totalCount: data.total_count,
      };
    } catch (err) {
      this.emitRequestEvent('GET', url, startedAt, statusCode, err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  }
}

/**
 * Appends query parameters to a URL string, skipping `undefined` values.
 * @internal
 */
function buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return base;
  const search = new URLSearchParams();
  for (const key in params) {
    const value = params[key];
    if (value !== undefined) {
      search.append(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

/**
 * Parses the `Link` response header to extract the next page number.
 *
 * GitHub Link header format:
 * `<https://api.github.com/...?page=2>; rel="next", <https://api.github.com/...?page=5>; rel="last"`
 *
 * @internal
 */
function parseNextPage(linkHeader: string | null): number | undefined {
  if (!linkHeader) return undefined;
  const match = linkHeader.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="next"/);
  return match ? parseInt(match[1], 10) : undefined;
}

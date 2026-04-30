import { Security } from './security/Security';
import { GitHubApiError } from './errors/GitHubApiError';
import { OrganizationResource } from './resources/OrganizationResource';
import type { RequestFn, RequestListFn, RequestTextFn, RequestBodyFn, RequestPatchFn, RequestDeleteFn, RequestPutFn, RequestBodyPutFn } from './resources/OrganizationResource';
import { RepositoryResource } from './resources/RepositoryResource';
import { UserResource } from './resources/UserResource';
import { GistResource } from './resources/GistResource';
import type { GitHubUser } from './domain/User';
import type { GitHubRepository, SearchReposParams } from './domain/Repository';
import type { GitHubGist, GistsParams, CreateGistData } from './domain/Gist';
import type { GitHubPagedResponse } from './domain/Pagination';

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
  private readonly listeners: Map<keyof GitHubClientEvents, GitHubClientEvents[keyof GitHubClientEvents][]> = new Map();

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
    const callbacks = this.listeners.get(event) ?? [];
    callbacks.push(callback);
    this.listeners.set(event, callbacks);
    return this;
  }

  private emit<K extends keyof GitHubClientEvents>(
    event: K,
    payload: Parameters<GitHubClientEvents[K]>[0],
  ): void {
    const callbacks = this.listeners.get(event) ?? [];
    for (const cb of callbacks) {
      (cb as (p: typeof payload) => void)(payload);
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
    const startedAt = new Date();
    let statusCode: number | undefined;
    try {
      const headers = options?.headers ?? this.security.getHeaders();
      const response = await fetch(url, { headers, signal: options?.signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const data = await response.json() as T;
      this.emit('request', { url, method: 'GET', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return data;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'GET', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
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
    const startedAt = new Date();
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
      this.emit('request', { url, method: 'GET', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return {
        values: data,
        hasNextPage: nextPage !== undefined,
        nextPage,
      };
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'GET', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
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
    const startedAt = new Date();
    let statusCode: number | undefined;
    try {
      const response = await fetch(url, { headers: this.security.getRawHeaders(), signal });
      statusCode = response.status;
      if (!response.ok) {
        throw new GitHubApiError(response.status, response.statusText);
      }
      const text = await response.text();
      this.emit('request', { url, method: 'GET', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return text;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'GET', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  private makeRequestFn(): RequestFn {
    return <T>(path: string, params?: Record<string, string | number | boolean>, signal?: AbortSignal) =>
      this.request<T>(path, params, { signal });
  }

  private makeRequestListFn(): RequestListFn {
    return <T>(path: string, params?: Record<string, string | number | boolean>, signal?: AbortSignal) =>
      this.requestList<T>(path, params, signal);
  }

  private makeRequestTextFn(): RequestTextFn {
    return (path: string, params?: Record<string, string | number | boolean>, signal?: AbortSignal) =>
      this.requestText(path, params, signal);
  }

  private async requestPost<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = new Date();
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
      const data = await response.json() as T;
      this.emit('request', { url, method: 'POST', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return data;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'POST', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  private makeRequestBodyFn(): RequestBodyFn {
    return <T>(path: string, body: unknown, signal?: AbortSignal) =>
      this.requestPost<T>(path, body, signal);
  }

  private async requestPatch<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = new Date();
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
      this.emit('request', { url, method: 'PATCH', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return data;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'PATCH', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  private async requestDelete(path: string, signal?: AbortSignal): Promise<void> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = new Date();
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
      this.emit('request', { url, method: 'DELETE', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'DELETE', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  private makeRequestPatchFn(): RequestPatchFn {
    return <T>(path: string, body: unknown, signal?: AbortSignal) =>
      this.requestPatch<T>(path, body, signal);
  }

  private makeRequestDeleteFn(): RequestDeleteFn {
    return (path: string, signal?: AbortSignal) =>
      this.requestDelete(path, signal);
  }

  private async requestPut(path: string, signal?: AbortSignal): Promise<void> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = new Date();
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
      this.emit('request', { url, method: 'PUT', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'PUT', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  private makeRequestPutFn(): RequestPutFn {
    return (path: string, signal?: AbortSignal) =>
      this.requestPut(path, signal);
  }

  private async requestBodyPut<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    const url = `${this.security.getApiUrl()}${path}`;
    const startedAt = new Date();
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
      const data = await response.json() as T;
      this.emit('request', { url, method: 'PUT', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return data;
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'PUT', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
      throw err;
    }
  }

  private makeRequestBodyPutFn(): RequestBodyPutFn {
    return <T>(path: string, body: unknown, signal?: AbortSignal) =>
      this.requestBodyPut<T>(path, body, signal);
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
    const startedAt = new Date();
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
      this.emit('request', { url, method: 'GET', startedAt, finishedAt: new Date(), durationMs: Date.now() - startedAt.getTime(), statusCode });
      return {
        values: data.items,
        hasNextPage: nextPage !== undefined,
        nextPage,
        totalCount: data.total_count,
      };
    } catch (err) {
      const finishedAt = new Date();
      this.emit('request', { url, method: 'GET', startedAt, finishedAt, durationMs: finishedAt.getTime() - startedAt.getTime(), statusCode, error: err instanceof Error ? err : new Error(String(err)) });
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
}

/**
 * Appends query parameters to a URL string, skipping `undefined` values.
 * @internal
 */
function buildUrl(base: string, params?: Record<string, string | number | boolean>): string {
  if (!params) return base;
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return base;
  const search = new URLSearchParams(entries.map(([k, v]) => [k, String(v)]));
  return `${base}?${search.toString()}`;
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

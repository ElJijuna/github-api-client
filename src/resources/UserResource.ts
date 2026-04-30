import type { GitHubUser } from '../domain/User';
import type { GitHubRepository, ReposParams } from '../domain/Repository';
import type { GitHubEvent, EventsParams } from '../domain/Event';
import type { GitHubPagedResponse } from '../domain/Pagination';
import type { RequestFn, RequestListFn, RequestTextFn, RequestBodyFn, RequestPatchFn, RequestDeleteFn, RequestBodyPutFn } from './OrganizationResource';
import { RepositoryResource } from './RepositoryResource';

/**
 * Represents a GitHub user resource with chainable async methods.
 *
 * Implements `PromiseLike<GitHubUser>` so it can be awaited directly
 * to fetch user info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get user info
 * const user = await gh.user('octocat');
 *
 * // Get the user's public repositories
 * const repos = await gh.user('octocat').repos({ sort: 'updated' });
 *
 * // Navigate into a specific repository
 * const prs = await gh.user('octocat').repo('Hello-World').pullRequests();
 * ```
 */
export class UserResource implements PromiseLike<GitHubUser> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly requestText: RequestTextFn,
    private readonly requestBody: RequestBodyFn,
    private readonly requestPatch: RequestPatchFn,
    private readonly requestDelete: RequestDeleteFn,
    private readonly requestBodyPut: RequestBodyPutFn,
    private readonly login: string,
  ) {
    this.basePath = `/users/${login}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the user info.
   * Delegates to {@link UserResource.get}.
   */
  then<TResult1 = GitHubUser, TResult2 = never>(
    onfulfilled?: ((value: GitHubUser) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the user details.
   *
   * `GET /users/{username}`
   *
   * @returns The user object
   */
  async get(signal?: AbortSignal): Promise<GitHubUser> {
    return this.request<GitHubUser>(this.basePath, undefined, signal);
  }

  /**
   * Fetches public repositories for this user.
   *
   * `GET /users/{username}/repos`
   *
   * @param params - Optional filters: `type`, `sort`, `direction`, `per_page`, `page`
   * @returns A paged response of repositories
   */
  async repos(params?: ReposParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubRepository>> {
    return this.requestList<GitHubRepository>(
      `${this.basePath}/repos`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Returns a {@link RepositoryResource} for a given repository under this user,
   * providing access to all repository sub-resources.
   *
   * @param name - The repository name
   * @returns A chainable repository resource
   *
   * @example
   * ```typescript
   * const repo    = await gh.user('octocat').repo('Hello-World');
   * const content = await gh.user('octocat').repo('Hello-World').raw('README.md');
   * ```
   */
  repo(name: string): RepositoryResource {
    return new RepositoryResource(
      this.request,
      this.requestList,
      this.requestText,
      this.requestBody,
      this.requestPatch,
      this.requestDelete,
      this.requestBodyPut,
      this.login,
      name,
    );
  }

  /**
   * Fetches the users this user is following.
   *
   * `GET /users/{username}/following`
   *
   * @returns A paged response of users
   */
  async following(params?: { per_page?: number; page?: number }, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubUser>> {
    return this.requestList<GitHubUser>(
      `${this.basePath}/following`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches the users following this user.
   *
   * `GET /users/{username}/followers`
   *
   * @returns A paged response of users
   */
  async followers(params?: { per_page?: number; page?: number }, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubUser>> {
    return this.requestList<GitHubUser>(
      `${this.basePath}/followers`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Lists public events performed by this user.
   *
   * `GET /users/{username}/events/public`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of public events
   */
  async publicEvents(params?: EventsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubEvent>> {
    return this.requestList<GitHubEvent>(
      `${this.basePath}/events/public`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }
}

import type { GitHubOrganization, OrgMembersParams, CreateOrgRepoData } from '../domain/Organization';
import type { GitHubRepository, ReposParams } from '../domain/Repository';
import type { GitHubUser } from '../domain/User';
import type { GitHubPagedResponse } from '../domain/Pagination';
import { RepositoryResource } from './RepositoryResource';

/** @internal */
export type RequestFn = <T>(
  path: string,
  params?: Record<string, string | number | boolean>,
) => Promise<T>;

/** @internal */
export type RequestListFn = <T>(
  path: string,
  params?: Record<string, string | number | boolean>,
) => Promise<GitHubPagedResponse<T>>;

/** @internal */
export type RequestTextFn = (
  path: string,
  params?: Record<string, string | number | boolean>,
) => Promise<string>;

/** @internal */
export type RequestBodyFn = <T>(
  path: string,
  body: unknown,
) => Promise<T>;

/** @internal */
export type RequestPatchFn = <T>(
  path: string,
  body: unknown,
) => Promise<T>;

/** @internal */
export type RequestDeleteFn = (path: string) => Promise<void>;

/**
 * Represents a GitHub organization resource with chainable async methods.
 *
 * Implements `PromiseLike<GitHubOrganization>` so it can be awaited directly
 * to fetch the organization info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get organization info
 * const org = await gh.org('github');
 *
 * // Get repositories
 * const repos = await gh.org('github').repos({ type: 'public', per_page: 50 });
 *
 * // Navigate into a specific repository
 * const prs = await gh.org('github').repo('linguist').pullRequests({ state: 'open' });
 *
 * // Get members
 * const members = await gh.org('github').members({ role: 'admin' });
 * ```
 */
export class OrganizationResource implements PromiseLike<GitHubOrganization> {
  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly requestText: RequestTextFn,
    private readonly requestBody: RequestBodyFn,
    private readonly requestPatch: RequestPatchFn,
    private readonly requestDelete: RequestDeleteFn,
    private readonly org: string,
  ) {}

  /**
   * Allows the resource to be awaited directly, resolving with the organization info.
   * Delegates to {@link OrganizationResource.get}.
   */
  then<TResult1 = GitHubOrganization, TResult2 = never>(
    onfulfilled?: ((value: GitHubOrganization) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the organization details.
   *
   * `GET /orgs/{org}`
   *
   * @returns The organization object
   */
  async get(): Promise<GitHubOrganization> {
    return this.request<GitHubOrganization>(`/orgs/${this.org}`);
  }

  /**
   * Fetches repositories belonging to this organization.
   *
   * `GET /orgs/{org}/repos`
   *
   * @param params - Optional filters: `type`, `sort`, `direction`, `per_page`, `page`
   * @returns A paged response of repositories
   */
  async repos(params?: ReposParams): Promise<GitHubPagedResponse<GitHubRepository>> {
    return this.requestList<GitHubRepository>(
      `/orgs/${this.org}/repos`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link RepositoryResource} for a given repository name within this organization.
   *
   * The returned resource can be awaited directly to fetch repository info,
   * or chained to access nested resources.
   *
   * @param name - The repository name (e.g., `'linguist'`)
   * @returns A chainable repository resource
   *
   * @example
   * ```typescript
   * const repo    = await gh.org('github').repo('linguist');
   * const prs     = await gh.org('github').repo('linguist').pullRequests({ state: 'open' });
   * const commits = await gh.org('github').repo('linguist').commits({ per_page: 10 });
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
      this.org,
      name,
    );
  }

  /**
   * Fetches members of this organization.
   *
   * `GET /orgs/{org}/members`
   *
   * @param params - Optional filters: `role`, `filter`, `per_page`, `page`
   * @returns A paged response of users
   */
  async members(params?: OrgMembersParams): Promise<GitHubPagedResponse<GitHubUser>> {
    return this.requestList<GitHubUser>(
      `/orgs/${this.org}/members`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Creates a new repository in this organization.
   *
   * `POST /orgs/{org}/repos`
   *
   * @param data - Repository creation options. `name` is required.
   * @returns The newly created repository
   *
   * @example
   * ```typescript
   * const repo = await gh.org('my-org').createRepo({
   *   name: 'my-new-repo',
   *   description: 'My new repository',
   *   private: true,
   *   auto_init: true,
   * });
   * ```
   */
  async createRepo(data: CreateOrgRepoData): Promise<GitHubRepository> {
    return this.requestBody<GitHubRepository>(`/orgs/${this.org}/repos`, data);
  }
}

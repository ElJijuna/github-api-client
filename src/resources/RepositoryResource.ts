import type { GitHubRepository, ReposParams, ForksParams } from '../domain/Repository';
import type { GitHubPullRequest, PullRequestsParams } from '../domain/PullRequest';
import type { GitHubCommit, CommitsParams } from '../domain/Commit';
import type { GitHubBranch, BranchesParams } from '../domain/Branch';
import type { GitHubTag, TagsParams } from '../domain/Tag';
import type { GitHubRelease, ReleasesParams } from '../domain/Release';
import type { GitHubWebhook, WebhooksParams } from '../domain/Webhook';
import type { GitHubContent, ContentParams } from '../domain/Content';
import type { GitHubPagedResponse, PaginationParams } from '../domain/Pagination';
import type { RequestFn, RequestListFn, RequestTextFn } from './OrganizationResource';
import { PullRequestResource } from './PullRequestResource';
import { CommitResource } from './CommitResource';

/**
 * Represents a GitHub repository resource with chainable async methods.
 *
 * Implements `PromiseLike<GitHubRepository>` so it can be awaited directly
 * to fetch repository info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get repository info
 * const repo = await gh.org('github').repo('linguist');
 *
 * // Get pull requests
 * const prs = await gh.org('github').repo('linguist').pullRequests({ state: 'open' });
 *
 * // Navigate into a specific pull request
 * const files = await gh.org('github').repo('linguist').pullRequest(42).files();
 *
 * // Get commits
 * const commits = await gh.org('github').repo('linguist').commits({ per_page: 10 });
 *
 * // Get raw file content
 * const content = await gh.org('github').repo('linguist').raw('README.md');
 * ```
 */
export class RepositoryResource implements PromiseLike<GitHubRepository> {
  private readonly owner: string;
  private readonly repo: string;
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly requestText: RequestTextFn,
    owner: string,
    repo: string,
  ) {
    this.owner = owner;
    this.repo = repo;
    this.basePath = `/repos/${owner}/${repo}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the repository info.
   * Delegates to {@link RepositoryResource.get}.
   */
  then<TResult1 = GitHubRepository, TResult2 = never>(
    onfulfilled?: ((value: GitHubRepository) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the repository details.
   *
   * `GET /repos/{owner}/{repo}`
   *
   * @returns The repository object
   */
  async get(): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(this.basePath);
  }

  /**
   * Fetches pull requests for this repository.
   *
   * `GET /repos/{owner}/{repo}/pulls`
   *
   * @param params - Optional filters: `state`, `head`, `base`, `sort`, `direction`, `per_page`, `page`
   * @returns A paged response of pull requests
   */
  async pullRequests(params?: PullRequestsParams): Promise<GitHubPagedResponse<GitHubPullRequest>> {
    return this.requestList<GitHubPullRequest>(
      `${this.basePath}/pulls`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link PullRequestResource} for a given pull request number.
   *
   * The returned resource can be awaited directly to fetch pull request info,
   * or chained to access nested resources.
   *
   * @param pullNumber - The pull request number (not the ID)
   * @returns A chainable pull request resource
   *
   * @example
   * ```typescript
   * const pr      = await gh.org('github').repo('linguist').pullRequest(42);
   * const files   = await gh.org('github').repo('linguist').pullRequest(42).files();
   * const reviews = await gh.org('github').repo('linguist').pullRequest(42).reviews();
   * ```
   */
  pullRequest(pullNumber: number): PullRequestResource {
    return new PullRequestResource(
      this.request,
      this.requestList,
      this.owner,
      this.repo,
      pullNumber,
    );
  }

  /**
   * Fetches commits for this repository.
   *
   * `GET /repos/{owner}/{repo}/commits`
   *
   * @param params - Optional filters: `sha`, `path`, `author`, `since`, `until`, `per_page`, `page`
   * @returns A paged response of commits
   */
  async commits(params?: CommitsParams): Promise<GitHubPagedResponse<GitHubCommit>> {
    return this.requestList<GitHubCommit>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Returns a {@link CommitResource} for a given commit ref (SHA, branch, or tag).
   *
   * The returned resource can be awaited directly to fetch commit info,
   * or chained to access nested resources.
   *
   * @param ref - Commit SHA, branch name, or tag name
   * @returns A chainable commit resource
   *
   * @example
   * ```typescript
   * const commit   = await gh.org('github').repo('linguist').commit('abc123');
   * const statuses = await gh.org('github').repo('linguist').commit('abc123').statuses();
   * ```
   */
  commit(ref: string): CommitResource {
    return new CommitResource(
      this.request,
      this.requestList,
      this.owner,
      this.repo,
      ref,
    );
  }

  /**
   * Fetches branches for this repository.
   *
   * `GET /repos/{owner}/{repo}/branches`
   *
   * @param params - Optional filters: `protected`, `per_page`, `page`
   * @returns A paged response of branches
   */
  async branches(params?: BranchesParams): Promise<GitHubPagedResponse<GitHubBranch>> {
    return this.requestList<GitHubBranch>(
      `${this.basePath}/branches`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches a specific branch by name.
   *
   * `GET /repos/{owner}/{repo}/branches/{branch}`
   *
   * @param name - The branch name (e.g., `'main'`)
   * @returns The branch object
   */
  async branch(name: string): Promise<GitHubBranch> {
    return this.request<GitHubBranch>(`${this.basePath}/branches/${encodeURIComponent(name)}`);
  }

  /**
   * Fetches tags for this repository.
   *
   * `GET /repos/{owner}/{repo}/tags`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of tags
   */
  async tags(params?: TagsParams): Promise<GitHubPagedResponse<GitHubTag>> {
    return this.requestList<GitHubTag>(
      `${this.basePath}/tags`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches releases for this repository.
   *
   * `GET /repos/{owner}/{repo}/releases`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of releases
   */
  async releases(params?: ReleasesParams): Promise<GitHubPagedResponse<GitHubRelease>> {
    return this.requestList<GitHubRelease>(
      `${this.basePath}/releases`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the latest published release for this repository.
   *
   * `GET /repos/{owner}/{repo}/releases/latest`
   *
   * @returns The latest release object
   */
  async latestRelease(): Promise<GitHubRelease> {
    return this.request<GitHubRelease>(`${this.basePath}/releases/latest`);
  }

  /**
   * Fetches the forks of this repository.
   *
   * `GET /repos/{owner}/{repo}/forks`
   *
   * @param params - Optional filters: `sort`, `per_page`, `page`
   * @returns A paged response of forked repositories
   */
  async forks(params?: ForksParams): Promise<GitHubPagedResponse<GitHubRepository>> {
    return this.requestList<GitHubRepository>(
      `${this.basePath}/forks`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches webhooks configured on this repository.
   *
   * `GET /repos/{owner}/{repo}/hooks`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of webhooks
   */
  async webhooks(params?: WebhooksParams): Promise<GitHubPagedResponse<GitHubWebhook>> {
    return this.requestList<GitHubWebhook>(
      `${this.basePath}/hooks`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the contents of a file or directory in this repository.
   *
   * `GET /repos/{owner}/{repo}/contents/{path}`
   *
   * Returns a single {@link GitHubContent} for files, or an array for directories.
   *
   * @param path - Path to the file or directory (e.g., `'src/index.ts'` or `'src'`). Omit for root.
   * @param params - Optional: `ref` (branch, tag, or commit SHA)
   * @returns File content object or array of directory entries
   */
  async contents(path?: string, params?: ContentParams): Promise<GitHubContent | GitHubContent[]> {
    const contentPath = path ? `${this.basePath}/contents/${path}` : `${this.basePath}/contents`;
    return this.request<GitHubContent | GitHubContent[]>(
      contentPath,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the raw text content of a file in this repository.
   *
   * Uses `Accept: application/vnd.github.raw+json` to retrieve the file directly
   * without base64 encoding.
   *
   * `GET /repos/{owner}/{repo}/contents/{filePath}`
   *
   * @param filePath - Path to the file (e.g., `'src/index.ts'`)
   * @param params - Optional: `ref` (branch, tag, or commit SHA)
   * @returns The raw file content as a string
   */
  async raw(filePath: string, params?: ContentParams): Promise<string> {
    return this.requestText(
      `${this.basePath}/contents/${filePath}`,
      params as Record<string, string | number | boolean>,
    );
  }

  /**
   * Fetches the repository topics.
   *
   * `GET /repos/{owner}/{repo}/topics`
   *
   * @returns An array of topic strings
   */
  async topics(): Promise<string[]> {
    const data = await this.request<{ names: string[] }>(`${this.basePath}/topics`);
    return data.names;
  }

  /**
   * Fetches contributors to this repository.
   *
   * `GET /repos/{owner}/{repo}/contributors`
   *
   * @param params - Optional filters: `anon` (include anonymous contributors), `per_page`, `page`
   * @returns A paged response of contributors
   */
  async contributors(params?: PaginationParams & { anon?: boolean }): Promise<GitHubPagedResponse<{ login?: string; id?: number; contributions: number; avatar_url?: string; html_url?: string }>> {
    return this.requestList(
      `${this.basePath}/contributors`,
      params as Record<string, string | number | boolean>,
    );
  }
}

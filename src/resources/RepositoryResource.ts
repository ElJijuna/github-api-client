import type { GitHubRepository, ReposParams, ForksParams, CreateForkData } from '../domain/Repository';
import type { GitHubPullRequest, PullRequestsParams } from '../domain/PullRequest';
import type { GitHubCommit, CommitsParams } from '../domain/Commit';
import type { GitHubBranch, BranchesParams } from '../domain/Branch';
import type { GitHubTag, TagsParams } from '../domain/Tag';
import type { GitHubRelease, ReleasesParams } from '../domain/Release';
import type { GitHubWebhook, WebhooksParams, CreateWebhookData, UpdateWebhookData } from '../domain/Webhook';
import type { GitHubContent, ContentParams } from '../domain/Content';
import type { GitHubIssue, IssuesParams, CreateIssueData } from '../domain/Issue';
import type { GitHubPagedResponse, PaginationParams } from '../domain/Pagination';
import type { RequestFn, RequestListFn, RequestTextFn, RequestBodyFn, RequestPatchFn, RequestDeleteFn, RequestBodyPutFn } from './OrganizationResource';
import { PullRequestResource } from './PullRequestResource';
import { CommitResource } from './CommitResource';
import { IssueResource } from './IssueResource';

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
    private readonly requestBody: RequestBodyFn,
    private readonly requestPatch: RequestPatchFn,
    private readonly requestDelete: RequestDeleteFn,
    private readonly requestBodyPut: RequestBodyPutFn,
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
  async get(signal?: AbortSignal): Promise<GitHubRepository> {
    return this.request<GitHubRepository>(this.basePath, undefined, signal);
  }

  /**
   * Fetches pull requests for this repository.
   *
   * `GET /repos/{owner}/{repo}/pulls`
   *
   * @param params - Optional filters: `state`, `head`, `base`, `sort`, `direction`, `per_page`, `page`
   * @returns A paged response of pull requests
   */
  async pullRequests(params?: PullRequestsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubPullRequest>> {
    return this.requestList<GitHubPullRequest>(
      `${this.basePath}/pulls`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Returns a {@link PullRequestResource} for a given pull request number.
   *
   * @param pullNumber - The pull request number (not the ID)
   * @returns A chainable pull request resource
   */
  pullRequest(pullNumber: number): PullRequestResource {
    return new PullRequestResource(
      this.request,
      this.requestList,
      this.requestBody,
      this.requestPatch,
      this.requestBodyPut,
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
  async commits(params?: CommitsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubCommit>> {
    return this.requestList<GitHubCommit>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Returns a {@link CommitResource} for a given commit ref (SHA, branch, or tag).
   *
   * @param ref - Commit SHA, branch name, or tag name
   * @returns A chainable commit resource
   */
  commit(ref: string): CommitResource {
    return new CommitResource(
      this.request,
      this.requestList,
      this.requestBody,
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
  async branches(params?: BranchesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubBranch>> {
    return this.requestList<GitHubBranch>(
      `${this.basePath}/branches`,
      params as Record<string, string | number | boolean>,
      signal,
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
  async branch(name: string, signal?: AbortSignal): Promise<GitHubBranch> {
    return this.request<GitHubBranch>(`${this.basePath}/branches/${encodeURIComponent(name)}`, undefined, signal);
  }

  /**
   * Fetches tags for this repository.
   *
   * `GET /repos/{owner}/{repo}/tags`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of tags
   */
  async tags(params?: TagsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubTag>> {
    return this.requestList<GitHubTag>(
      `${this.basePath}/tags`,
      params as Record<string, string | number | boolean>,
      signal,
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
  async releases(params?: ReleasesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubRelease>> {
    return this.requestList<GitHubRelease>(
      `${this.basePath}/releases`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches the latest published release for this repository.
   *
   * `GET /repos/{owner}/{repo}/releases/latest`
   *
   * @returns The latest release object
   */
  async latestRelease(signal?: AbortSignal): Promise<GitHubRelease> {
    return this.request<GitHubRelease>(`${this.basePath}/releases/latest`, undefined, signal);
  }

  /**
   * Fetches the forks of this repository.
   *
   * `GET /repos/{owner}/{repo}/forks`
   *
   * @param params - Optional filters: `sort`, `per_page`, `page`
   * @returns A paged response of forked repositories
   */
  async forks(params?: ForksParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubRepository>> {
    return this.requestList<GitHubRepository>(
      `${this.basePath}/forks`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Creates a fork of this repository.
   *
   * `POST /repos/{owner}/{repo}/forks`
   *
   * Note: Forking is asynchronous on GitHub's side. The returned repository
   * may not be fully ready immediately after this call returns.
   *
   * @param data - Optional: target organization, custom name, default-branch-only flag
   * @returns The newly created fork
   *
   * @example
   * ```typescript
   * // Fork into authenticated user's account
   * const fork = await gh.repo('octocat', 'Hello-World').createFork();
   *
   * // Fork into an organization with a custom name
   * const fork = await gh.repo('octocat', 'Hello-World').createFork({
   *   organization: 'my-org',
   *   name: 'hello-world-fork',
   * });
   * ```
   */
  async createFork(data?: CreateForkData, signal?: AbortSignal): Promise<GitHubRepository> {
    return this.requestBody<GitHubRepository>(`${this.basePath}/forks`, data ?? {}, signal);
  }

  /**
   * Fetches webhooks configured on this repository.
   *
   * `GET /repos/{owner}/{repo}/hooks`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of webhooks
   */
  async webhooks(params?: WebhooksParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubWebhook>> {
    return this.requestList<GitHubWebhook>(
      `${this.basePath}/hooks`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Creates a webhook on this repository.
   *
   * `POST /repos/{owner}/{repo}/hooks`
   *
   * @param data - Webhook configuration. `config.url` is required.
   * @returns The created webhook
   *
   * @example
   * ```typescript
   * const hook = await gh.repo('octocat', 'Hello-World').createWebhook({
   *   config: { url: 'https://example.com/webhook', content_type: 'json', secret: 'mysecret' },
   *   events: ['push', 'pull_request'],
   * });
   * ```
   */
  async createWebhook(data: CreateWebhookData, signal?: AbortSignal): Promise<GitHubWebhook> {
    return this.requestBody<GitHubWebhook>(`${this.basePath}/hooks`, { name: 'web', ...data }, signal);
  }

  /**
   * Updates an existing webhook on this repository.
   *
   * `PATCH /repos/{owner}/{repo}/hooks/{hook_id}`
   *
   * @param hookId - The webhook ID
   * @param data - Fields to update
   * @returns The updated webhook
   *
   * @example
   * ```typescript
   * const hook = await gh.repo('octocat', 'Hello-World').updateWebhook(1, {
   *   active: false,
   *   add_events: ['issues'],
   * });
   * ```
   */
  async updateWebhook(hookId: number, data: UpdateWebhookData, signal?: AbortSignal): Promise<GitHubWebhook> {
    return this.requestPatch<GitHubWebhook>(`${this.basePath}/hooks/${hookId}`, data, signal);
  }

  /**
   * Deletes a webhook from this repository.
   *
   * `DELETE /repos/{owner}/{repo}/hooks/{hook_id}`
   *
   * @param hookId - The webhook ID to delete
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').deleteWebhook(1);
   * ```
   */
  async deleteWebhook(hookId: number, signal?: AbortSignal): Promise<void> {
    return this.requestDelete(`${this.basePath}/hooks/${hookId}`, signal);
  }

  /**
   * Fetches the contents of a file or directory in this repository.
   *
   * `GET /repos/{owner}/{repo}/contents/{path}`
   *
   * Returns a single {@link GitHubContent} for files, or an array for directories.
   *
   * @param path - Path to the file or directory. Omit for root.
   * @param params - Optional: `ref` (branch, tag, or commit SHA)
   */
  async contents(path?: string, params?: ContentParams, signal?: AbortSignal): Promise<GitHubContent | GitHubContent[]> {
    const contentPath = path ? `${this.basePath}/contents/${path}` : `${this.basePath}/contents`;
    return this.request<GitHubContent | GitHubContent[]>(
      contentPath,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches the raw text content of a file in this repository.
   *
   * Uses `Accept: application/vnd.github.raw+json`.
   *
   * `GET /repos/{owner}/{repo}/contents/{filePath}`
   *
   * @param filePath - Path to the file (e.g., `'src/index.ts'`)
   * @param params - Optional: `ref` (branch, tag, or commit SHA)
   * @returns The raw file content as a string
   */
  async raw(filePath: string, params?: ContentParams, signal?: AbortSignal): Promise<string> {
    return this.requestText(
      `${this.basePath}/contents/${filePath}`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches the repository topics.
   *
   * `GET /repos/{owner}/{repo}/topics`
   *
   * @returns An array of topic strings
   */
  async topics(signal?: AbortSignal): Promise<string[]> {
    const data = await this.request<{ names: string[] }>(`${this.basePath}/topics`, undefined, signal);
    return data.names;
  }

  /**
   * Fetches contributors to this repository.
   *
   * `GET /repos/{owner}/{repo}/contributors`
   *
   * @param params - Optional filters: `anon`, `per_page`, `page`
   */
  async contributors(params?: PaginationParams & { anon?: boolean }, signal?: AbortSignal): Promise<GitHubPagedResponse<{ login?: string; id?: number; contributions: number; avatar_url?: string; html_url?: string }>> {
    return this.requestList(
      `${this.basePath}/contributors`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches issues for this repository.
   *
   * `GET /repos/{owner}/{repo}/issues`
   *
   * Note: GitHub returns pull requests as issues in this endpoint.
   * Filter them out by checking for the absence of `pull_request`.
   *
   * @param params - Optional filters: `state`, `labels`, `sort`, `direction`, `since`, `per_page`, `page`
   * @returns A paged response of issues
   */
  async issues(params?: IssuesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubIssue>> {
    return this.requestList<GitHubIssue>(
      `${this.basePath}/issues`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Returns an {@link IssueResource} for a given issue number.
   *
   * The returned resource can be awaited directly to fetch issue info,
   * or chained to access sub-resources (comments).
   *
   * @param issueNumber - The issue number within the repository
   * @returns A chainable issue resource
   *
   * @example
   * ```typescript
   * const issue    = await gh.repo('octocat', 'Hello-World').issue(1);
   * const comments = await gh.repo('octocat', 'Hello-World').issue(1).comments();
   * ```
   */
  issue(issueNumber: number): IssueResource {
    return new IssueResource(
      this.request,
      this.requestList,
      this.owner,
      this.repo,
      issueNumber,
    );
  }

  /**
   * Creates an issue in this repository.
   *
   * `POST /repos/{owner}/{repo}/issues`
   *
   * @param data - Issue data. `title` is required.
   * @returns The created issue
   *
   * @example
   * ```typescript
   * const issue = await gh.repo('octocat', 'Hello-World').createIssue({
   *   title: 'Found a bug',
   *   body: 'Steps to reproduce...',
   *   labels: ['bug'],
   * });
   * ```
   */
  async createIssue(data: CreateIssueData, signal?: AbortSignal): Promise<GitHubIssue> {
    return this.requestBody<GitHubIssue>(`${this.basePath}/issues`, data, signal);
  }
}

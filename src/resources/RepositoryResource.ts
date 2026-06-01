import type { GitHubRepository, ForksParams, CreateForkData, RepoLanguages } from '../domain/Repository';
import type { GitHubPullRequest, PullRequestsParams, GitHubLabel, GitHubMilestone } from '../domain/PullRequest';
import type { LabelsParams, CreateLabelData, UpdateLabelData } from '../domain/Label';
import type { MilestonesParams, CreateMilestoneData, UpdateMilestoneData } from '../domain/Milestone';
import type { CollaboratorsParams, AddCollaboratorData } from '../domain/Collaborator';
import type { GitHubUser } from '../domain/User';
import type { GitHubCommit, CommitsParams } from '../domain/Commit';
import type { GitHubBranch, BranchesParams } from '../domain/Branch';
import type { GitHubTag, TagsParams } from '../domain/Tag';
import type { GitHubRelease, ReleasesParams, CreateReleaseData, UpdateReleaseData } from '../domain/Release';
import type { GitHubWebhook, WebhooksParams, CreateWebhookData, UpdateWebhookData } from '../domain/Webhook';
import type { GitHubContent, ContentParams } from '../domain/Content';
import type { GitHubIssue, IssuesParams, CreateIssueData } from '../domain/Issue';
import type { GitHubRepositoryAdvisory, RepoAdvisoriesParams, CreateAdvisoryData, UpdateAdvisoryData } from '../domain/Advisory';
import type { GitHubPagedResponse, PaginationParams } from '../domain/Pagination';
import type { GitHubWorkflowRunsResponse, WorkflowRunsParams, GitHubWorkflowRun } from '../domain/WorkflowRun';
import type { GitHubWorkflowsResponse, WorkflowsParams, TriggerWorkflowData } from '../domain/Workflow';
import type { GitHubTree, GitTreeParams } from '../domain/GitTree';
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
   * Returns the programming languages used in the repository and the number of bytes of code written in each language.
   *
   * `GET /repos/{owner}/{repo}/languages`
   *
   * @param signal - Optional AbortSignal to cancel the request
   * @returns Object mapping language names to byte counts
   * @throws {GitHubApiError} If the repository is not found or access is denied
   *
   * @example
   * ```typescript
   * const langs = await gh.repo('facebook', 'react').languages();
   * // { JavaScript: 1234567, TypeScript: 89012 }
   * ```
   */
  async languages(signal?: AbortSignal): Promise<RepoLanguages> {
    return this.request<RepoLanguages>(`${this.basePath}/languages`, undefined, signal);
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
   * Fetches a single release by its numeric ID.
   *
   * `GET /repos/{owner}/{repo}/releases/{release_id}`
   *
   * @param releaseId - The release ID
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The release object
   * @throws {GitHubApiError} If the release is not found or access is denied
   *
   * @example
   * ```typescript
   * const release = await gh.repo('octocat', 'Hello-World').release(1);
   * ```
   */
  async release(releaseId: number, signal?: AbortSignal): Promise<GitHubRelease> {
    return this.request<GitHubRelease>(`${this.basePath}/releases/${releaseId}`, undefined, signal);
  }

  /**
   * Creates a new release.
   *
   * `POST /repos/{owner}/{repo}/releases`
   *
   * @param data - Release data: `tag_name` (required), `name`, `body`, `draft`, `prerelease`, `target_commitish`
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The created release
   * @throws {GitHubApiError} If the tag already has a release or access is denied
   *
   * @example
   * ```typescript
   * const release = await gh.repo('octocat', 'Hello-World').createRelease({
   *   tag_name: 'v1.2.0',
   *   name:     'v1.2.0',
   *   body:     '## Changelog\n- Fix bug #42',
   * });
   * ```
   */
  async createRelease(data: CreateReleaseData, signal?: AbortSignal): Promise<GitHubRelease> {
    return this.requestBody<GitHubRelease>(`${this.basePath}/releases`, data, signal);
  }

  /**
   * Updates an existing release.
   *
   * `PATCH /repos/{owner}/{repo}/releases/{release_id}`
   *
   * @param releaseId - The release ID to update
   * @param data - Fields to update: `tag_name`, `name`, `body`, `draft`, `prerelease`
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The updated release
   * @throws {GitHubApiError} If the release is not found or access is denied
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').updateRelease(1, { draft: false });
   * ```
   */
  async updateRelease(releaseId: number, data: UpdateReleaseData, signal?: AbortSignal): Promise<GitHubRelease> {
    return this.requestPatch<GitHubRelease>(`${this.basePath}/releases/${releaseId}`, data, signal);
  }

  /**
   * Deletes a release.
   *
   * `DELETE /repos/{owner}/{repo}/releases/{release_id}`
   *
   * @param releaseId - The release ID to delete
   * @param signal - Optional AbortSignal to cancel the request
   * @throws {GitHubApiError} If the release is not found or access is denied
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').deleteRelease(1);
   * ```
   */
  async deleteRelease(releaseId: number, signal?: AbortSignal): Promise<void> {
    return this.requestDelete(`${this.basePath}/releases/${releaseId}`, signal);
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
   * Fetches the raw text content of multiple files in this repository.
   *
   * Uses `Accept: application/vnd.github.raw+json` for each file request.
   *
   * Files are fetched concurrently. If an individual file request fails, that
   * file is omitted from the returned record and the remaining files are still
   * returned.
   *
   * @param filePaths - Paths to the files (e.g., `['README.md', 'src/index.ts']`)
   * @param params - Optional: `ref` (branch, tag, or commit SHA)
   * @returns A record mapping each fetched file path to its raw content
   */
  async multipleRaw(filePaths: string[], params?: ContentParams, signal?: AbortSignal): Promise<Record<string, string>> {
    const result = await Promise.allSettled(
      filePaths.map((p) => this.raw(p, params, signal))
    );

    return result.reduce((acc, res, index) => {
      if (res.status === 'fulfilled') {
        acc[filePaths[index]] = res.value;
      }

      return acc;
    }, {} as Record<string, string>);
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
      this.requestBody,
      this.requestPatch,
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

  /**
   * Lists labels for this repository.
   *
   * `GET /repos/{owner}/{repo}/labels`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of labels
   *
   * @example
   * ```typescript
   * const labels = await gh.repo('octocat', 'Hello-World').labels();
   * ```
   */
  async labels(params?: LabelsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubLabel>> {
    return this.requestList<GitHubLabel>(
      `${this.basePath}/labels`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches a single label by name.
   *
   * `GET /repos/{owner}/{repo}/labels/{name}`
   *
   * @param name - The label name
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The label object
   * @throws {GitHubApiError} If the label is not found
   *
   * @example
   * ```typescript
   * const label = await gh.repo('octocat', 'Hello-World').label('bug');
   * ```
   */
  async label(name: string, signal?: AbortSignal): Promise<GitHubLabel> {
    return this.request<GitHubLabel>(`${this.basePath}/labels/${encodeURIComponent(name)}`, undefined, signal);
  }

  /**
   * Creates a label in this repository.
   *
   * `POST /repos/{owner}/{repo}/labels`
   *
   * @param data - Label data: `name` and `color` are required
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The created label
   * @throws {GitHubApiError} If a label with that name already exists
   *
   * @example
   * ```typescript
   * const label = await gh.repo('octocat', 'Hello-World').createLabel({ name: 'enhancement', color: '84b6eb' });
   * ```
   */
  async createLabel(data: CreateLabelData, signal?: AbortSignal): Promise<GitHubLabel> {
    return this.requestBody<GitHubLabel>(`${this.basePath}/labels`, data, signal);
  }

  /**
   * Updates a label.
   *
   * `PATCH /repos/{owner}/{repo}/labels/{name}`
   *
   * @param name - The current label name
   * @param data - Fields to update: `name`, `color`, `description`
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The updated label
   * @throws {GitHubApiError} If the label is not found
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').updateLabel('bug', { color: 'ee0701' });
   * ```
   */
  async updateLabel(name: string, data: UpdateLabelData, signal?: AbortSignal): Promise<GitHubLabel> {
    return this.requestPatch<GitHubLabel>(`${this.basePath}/labels/${encodeURIComponent(name)}`, data, signal);
  }

  /**
   * Deletes a label.
   *
   * `DELETE /repos/{owner}/{repo}/labels/{name}`
   *
   * @param name - The label name to delete
   * @param signal - Optional AbortSignal to cancel the request
   * @throws {GitHubApiError} If the label is not found
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').deleteLabel('wontfix');
   * ```
   */
  async deleteLabel(name: string, signal?: AbortSignal): Promise<void> {
    return this.requestDelete(`${this.basePath}/labels/${encodeURIComponent(name)}`, signal);
  }

  /**
   * Lists milestones for this repository.
   *
   * `GET /repos/{owner}/{repo}/milestones`
   *
   * @param params - Optional filters: `state`, `sort`, `direction`, `per_page`, `page`
   * @returns A paged response of milestones
   *
   * @example
   * ```typescript
   * const milestones = await gh.repo('octocat', 'Hello-World').milestones({ state: 'open' });
   * ```
   */
  async milestones(params?: MilestonesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubMilestone>> {
    return this.requestList<GitHubMilestone>(
      `${this.basePath}/milestones`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches a single milestone by number.
   *
   * `GET /repos/{owner}/{repo}/milestones/{milestone_number}`
   *
   * @param milestoneNumber - The milestone number
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The milestone object
   * @throws {GitHubApiError} If the milestone is not found
   *
   * @example
   * ```typescript
   * const milestone = await gh.repo('octocat', 'Hello-World').milestone(1);
   * ```
   */
  async milestone(milestoneNumber: number, signal?: AbortSignal): Promise<GitHubMilestone> {
    return this.request<GitHubMilestone>(`${this.basePath}/milestones/${milestoneNumber}`, undefined, signal);
  }

  /**
   * Creates a milestone in this repository.
   *
   * `POST /repos/{owner}/{repo}/milestones`
   *
   * @param data - Milestone data: `title` is required
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The created milestone
   *
   * @example
   * ```typescript
   * const ms = await gh.repo('octocat', 'Hello-World').createMilestone({ title: 'v2.0', due_on: '2025-12-31T00:00:00Z' });
   * ```
   */
  async createMilestone(data: CreateMilestoneData, signal?: AbortSignal): Promise<GitHubMilestone> {
    return this.requestBody<GitHubMilestone>(`${this.basePath}/milestones`, data, signal);
  }

  /**
   * Updates a milestone.
   *
   * `PATCH /repos/{owner}/{repo}/milestones/{milestone_number}`
   *
   * @param milestoneNumber - The milestone number to update
   * @param data - Fields to update: `title`, `state`, `description`, `due_on`
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The updated milestone
   * @throws {GitHubApiError} If the milestone is not found
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').updateMilestone(1, { state: 'closed' });
   * ```
   */
  async updateMilestone(milestoneNumber: number, data: UpdateMilestoneData, signal?: AbortSignal): Promise<GitHubMilestone> {
    return this.requestPatch<GitHubMilestone>(`${this.basePath}/milestones/${milestoneNumber}`, data, signal);
  }

  /**
   * Deletes a milestone.
   *
   * `DELETE /repos/{owner}/{repo}/milestones/{milestone_number}`
   *
   * @param milestoneNumber - The milestone number to delete
   * @param signal - Optional AbortSignal to cancel the request
   * @throws {GitHubApiError} If the milestone is not found
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').deleteMilestone(1);
   * ```
   */
  async deleteMilestone(milestoneNumber: number, signal?: AbortSignal): Promise<void> {
    return this.requestDelete(`${this.basePath}/milestones/${milestoneNumber}`, signal);
  }

  /**
   * Lists collaborators for this repository.
   *
   * `GET /repos/{owner}/{repo}/collaborators`
   *
   * @param params - Optional filters: `affiliation`, `permission`, `per_page`, `page`
   * @returns A paged response of users who are collaborators
   *
   * @example
   * ```typescript
   * const collabs = await gh.repo('octocat', 'Hello-World').collaborators();
   * const outside = await gh.repo('octocat', 'Hello-World').collaborators({ affiliation: 'outside' });
   * ```
   */
  async collaborators(params?: CollaboratorsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubUser>> {
    return this.requestList<GitHubUser>(
      `${this.basePath}/collaborators`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Adds a collaborator to this repository.
   *
   * `PUT /repos/{owner}/{repo}/collaborators/{username}`
   *
   * Sends an invitation if the user is not yet a collaborator, or updates
   * their permission level if they already are. Returns `void` in both cases.
   *
   * @param username - The GitHub login of the user to add
   * @param data - Optional permission level (defaults to `'push'`)
   * @param signal - Optional AbortSignal to cancel the request
   * @throws {GitHubApiError} If the user is not found or access is denied
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').addCollaborator('hubot');
   * await gh.repo('octocat', 'Hello-World').addCollaborator('hubot', { permission: 'maintain' });
   * ```
   */
  async addCollaborator(username: string, data?: AddCollaboratorData, signal?: AbortSignal): Promise<void> {
    await this.requestBodyPut<unknown>(`${this.basePath}/collaborators/${username}`, data ?? {}, signal);
  }

  /**
   * Removes a collaborator from this repository.
   *
   * `DELETE /repos/{owner}/{repo}/collaborators/{username}`
   *
   * @param username - The GitHub login of the user to remove
   * @param signal - Optional AbortSignal to cancel the request
   * @throws {GitHubApiError} If the user is not found or access is denied
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').removeCollaborator('hubot');
   * ```
   */
  async removeCollaborator(username: string, signal?: AbortSignal): Promise<void> {
    return this.requestDelete(`${this.basePath}/collaborators/${username}`, signal);
  }

  /**
   * Lists security advisories for this repository.
   *
   * `GET /repos/{owner}/{repo}/security-advisories`
   *
   * @param params - Optional filters: `direction`, `sort`, `state`, `per_page`, `page`
   * @returns A paged response of repository advisories
   *
   * @example
   * ```typescript
   * const advisories = await gh.repo('octocat', 'Hello-World').repoAdvisories({ state: 'published' });
   * ```
   */
  async repoAdvisories(params?: RepoAdvisoriesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubRepositoryAdvisory>> {
    return this.requestList<GitHubRepositoryAdvisory>(
      `${this.basePath}/security-advisories`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Creates a draft security advisory in this repository.
   *
   * `POST /repos/{owner}/{repo}/security-advisories`
   *
   * @param data - Advisory data. `summary` and `description` are required.
   * @returns The created advisory draft
   *
   * @example
   * ```typescript
   * const advisory = await gh.repo('octocat', 'Hello-World').createAdvisory({
   *   summary: 'Remote code execution via crafted input',
   *   description: 'A vulnerability in...',
   *   severity: 'critical',
   * });
   * ```
   */
  async createAdvisory(data: CreateAdvisoryData, signal?: AbortSignal): Promise<GitHubRepositoryAdvisory> {
    return this.requestBody<GitHubRepositoryAdvisory>(`${this.basePath}/security-advisories`, data, signal);
  }

  /**
   * Fetches a single repository security advisory by its GHSA ID.
   *
   * `GET /repos/{owner}/{repo}/security-advisories/{ghsa_id}`
   *
   * @param ghsaId - The GHSA identifier (e.g., `'GHSA-xxxx-xxxx-xxxx'`)
   * @returns The repository advisory object
   */
  async repoAdvisory(ghsaId: string, signal?: AbortSignal): Promise<GitHubRepositoryAdvisory> {
    return this.request<GitHubRepositoryAdvisory>(`${this.basePath}/security-advisories/${ghsaId}`, undefined, signal);
  }

  /**
   * Updates a repository security advisory.
   *
   * `PATCH /repos/{owner}/{repo}/security-advisories/{ghsa_id}`
   *
   * @param ghsaId - The GHSA identifier
   * @param data - Fields to update
   * @returns The updated advisory
   *
   * @example
   * ```typescript
   * const updated = await gh.repo('octocat', 'Hello-World').updateAdvisory('GHSA-1234-5678-9abc', {
   *   state: 'published',
   * });
   * ```
   */
  async updateAdvisory(ghsaId: string, data: UpdateAdvisoryData, signal?: AbortSignal): Promise<GitHubRepositoryAdvisory> {
    return this.requestPatch<GitHubRepositoryAdvisory>(`${this.basePath}/security-advisories/${ghsaId}`, data, signal);
  }

  /**
   * Requests a CVE ID for a repository security advisory.
   *
   * `POST /repos/{owner}/{repo}/security-advisories/{ghsa_id}/cve`
   *
   * @param ghsaId - The GHSA identifier
   * @returns The updated advisory with the CVE request submitted
   */
  async requestCve(ghsaId: string, signal?: AbortSignal): Promise<GitHubRepositoryAdvisory> {
    return this.requestBody<GitHubRepositoryAdvisory>(`${this.basePath}/security-advisories/${ghsaId}/cve`, {}, signal);
  }

  /**
   * Lists workflow runs for this repository.
   *
   * `GET /repos/{owner}/{repo}/actions/runs`
   *
   * Returns the raw GitHub Actions response envelope including `total_count`
   * and the `workflow_runs` array. Use `params.per_page` to limit how many
   * runs are fetched (default GitHub: 30, max: 100).
   *
   * @param params - Optional filters: `branch`, `event`, `status`, `actor`, `created`, `per_page`, `page`
   * @returns Response envelope with `total_count` and `workflow_runs`
   *
   * @example
   * ```typescript
   * const { total_count, workflow_runs } = await gh.repo('octocat', 'Hello-World').workflowRuns({ per_page: 10 });
   * const lastRun = workflow_runs[0];
   * console.log(lastRun.conclusion); // 'success' | 'failure' | null ...
   * ```
   */
  async workflowRuns(params?: WorkflowRunsParams, signal?: AbortSignal): Promise<GitHubWorkflowRunsResponse> {
    return this.request<GitHubWorkflowRunsResponse>(
      `${this.basePath}/actions/runs`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Lists workflows defined in this repository.
   *
   * `GET /repos/{owner}/{repo}/actions/workflows`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns Response envelope with `total_count` and `workflows`
   *
   * @example
   * ```typescript
   * const { workflows } = await gh.repo('octocat', 'Hello-World').workflows();
   * ```
   */
  async workflows(params?: WorkflowsParams, signal?: AbortSignal): Promise<GitHubWorkflowsResponse> {
    return this.request<GitHubWorkflowsResponse>(
      `${this.basePath}/actions/workflows`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches a single workflow run by its ID.
   *
   * `GET /repos/{owner}/{repo}/actions/runs/{run_id}`
   *
   * @param runId - The workflow run ID
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The workflow run object
   * @throws {GitHubApiError} If the run is not found
   *
   * @example
   * ```typescript
   * const run = await gh.repo('octocat', 'Hello-World').workflowRun(12345);
   * ```
   */
  async workflowRun(runId: number, signal?: AbortSignal): Promise<GitHubWorkflowRun> {
    return this.request<GitHubWorkflowRun>(`${this.basePath}/actions/runs/${runId}`, undefined, signal);
  }

  /**
   * Cancels a workflow run in progress.
   *
   * `POST /repos/{owner}/{repo}/actions/runs/{run_id}/cancel`
   *
   * @param runId - The workflow run ID to cancel
   * @param signal - Optional AbortSignal to cancel the request
   * @throws {GitHubApiError} If the run is not found or cannot be cancelled
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').cancelWorkflowRun(12345);
   * ```
   */
  async cancelWorkflowRun(runId: number, signal?: AbortSignal): Promise<void> {
    await this.requestBody<unknown>(`${this.basePath}/actions/runs/${runId}/cancel`, {}, signal);
  }

  /**
   * Triggers a workflow dispatch event.
   *
   * `POST /repos/{owner}/{repo}/actions/workflows/{workflow_id}/dispatches`
   *
   * @param workflowId - The workflow ID (number) or file name (e.g., `'ci.yml'`)
   * @param data - Dispatch data: `ref` is required; `inputs` are optional
   * @param signal - Optional AbortSignal to cancel the request
   * @throws {GitHubApiError} If the workflow is not found or `ref` is invalid
   *
   * @example
   * ```typescript
   * await gh.repo('octocat', 'Hello-World').triggerWorkflow('ci.yml', { ref: 'main' });
   * await gh.repo('octocat', 'Hello-World').triggerWorkflow('ci.yml', { ref: 'main', inputs: { environment: 'staging' } });
   * ```
   */
  async triggerWorkflow(workflowId: number | string, data: TriggerWorkflowData, signal?: AbortSignal): Promise<void> {
    await this.requestBody<unknown>(`${this.basePath}/actions/workflows/${workflowId}/dispatches`, data, signal);
  }

  /**
   * Fetches a git tree for this repository.
   *
   * `GET /repos/{owner}/{repo}/git/trees/{tree_sha}`
   *
   * The `treeSha` parameter accepts a tree SHA, a branch name, or a tag name.
   *
   * @param treeSha - Tree SHA, branch name (e.g. `'main'`), or tag name
   * @param params - Optional: `recursive: '1'` to fetch the full tree recursively
   * @returns The tree object with its entries
   *
   * @example
   * ```typescript
   * // Get the tree of the 'main' branch
   * const tree = await gh.repo('octocat', 'Hello-World').gitTree('main');
   *
   * // Get the full recursive tree for a specific SHA
   * const fullTree = await gh.repo('octocat', 'Hello-World').gitTree('abc123', { recursive: '1' });
   * console.log(fullTree.tree.map(item => item.path));
   * ```
   */
  async gitTree(treeSha: string, params?: GitTreeParams, signal?: AbortSignal): Promise<GitHubTree> {
    return this.request<GitHubTree>(
      `${this.basePath}/git/trees/${treeSha}`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }
}

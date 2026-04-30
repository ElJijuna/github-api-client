import type { GitHubCommit } from '../domain/Commit';
import type { GitHubCommitStatus, GitHubCombinedStatus, GitHubCheckRun, CommitStatusesParams, CheckRunsParams, CreateStatusData, GitHubCommitComment, CommitCommentsParams, CommitCommentData } from '../domain/CommitStatus';
import type { GitHubPagedResponse } from '../domain/Pagination';
import type { RequestFn, RequestListFn, RequestBodyFn } from './OrganizationResource';

/**
 * Represents a GitHub commit resource with chainable async methods.
 *
 * Implements `PromiseLike<GitHubCommit>` so it can be awaited directly
 * to fetch the commit info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get commit info (includes stats and files)
 * const commit = await gh.org('github').repo('linguist').commit('abc123');
 *
 * // Get CI/CD statuses for this commit
 * const statuses = await gh.org('github').repo('linguist').commit('abc123').statuses();
 *
 * // Get the combined (aggregated) status
 * const combined = await gh.org('github').repo('linguist').commit('abc123').combinedStatus();
 *
 * // Get GitHub Actions check runs
 * const checks = await gh.org('github').repo('linguist').commit('abc123').checkRuns();
 * ```
 */
export class CommitResource implements PromiseLike<GitHubCommit> {
  private readonly basePath: string;
  private readonly ref: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly requestBody: RequestBodyFn,
    owner: string,
    repo: string,
    ref: string,
  ) {
    this.basePath = `/repos/${owner}/${repo}/commits/${ref}`;
    this.ref = ref;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the commit info.
   * Delegates to {@link CommitResource.get}.
   */
  then<TResult1 = GitHubCommit, TResult2 = never>(
    onfulfilled?: ((value: GitHubCommit) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the commit details, including stats and changed files.
   *
   * `GET /repos/{owner}/{repo}/commits/{ref}`
   *
   * @returns The commit object with stats and files
   */
  async get(signal?: AbortSignal): Promise<GitHubCommit> {
    return this.request<GitHubCommit>(this.basePath, undefined, signal);
  }

  /**
   * Fetches the individual commit statuses (from CI/CD systems via the Statuses API).
   *
   * `GET /repos/{owner}/{repo}/statuses/{sha}`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of commit statuses
   */
  async statuses(params?: CommitStatusesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubCommitStatus>> {
    const repoPath = this.basePath.replace(`/commits/${this.ref}`, '');
    return this.requestList<GitHubCommitStatus>(
      `${repoPath}/statuses/${this.ref}`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches the combined commit status — an aggregation of all statuses for this ref.
   *
   * `GET /repos/{owner}/{repo}/commits/{ref}/status`
   *
   * @returns The combined status object
   */
  async combinedStatus(signal?: AbortSignal): Promise<GitHubCombinedStatus> {
    return this.request<GitHubCombinedStatus>(`${this.basePath}/status`, undefined, signal);
  }

  /**
   * Fetches GitHub Actions check runs for this commit.
   *
   * `GET /repos/{owner}/{repo}/commits/{ref}/check-runs`
   *
   * @param params - Optional filters: `check_name`, `status`, `app_id`, `per_page`, `page`
   * @returns A paged response of check runs
   */
  async checkRuns(params?: CheckRunsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubCheckRun>> {
    const raw = await this.request<{ check_runs: GitHubCheckRun[] }>(
      `${this.basePath}/check-runs`,
      params as Record<string, string | number | boolean>,
      signal,
    );
    return {
      values: raw.check_runs,
      hasNextPage: false,
    };
  }

  /**
   * Creates a commit status (e.g., from a CI/CD system).
   *
   * `POST /repos/{owner}/{repo}/statuses/{sha}`
   *
   * @param data - Status data. `state` is required.
   * @returns The created commit status
   */
  async createStatus(data: CreateStatusData, signal?: AbortSignal): Promise<GitHubCommitStatus> {
    const repoPath = this.basePath.replace(`/commits/${this.ref}`, '');
    return this.requestBody<GitHubCommitStatus>(`${repoPath}/statuses/${this.ref}`, data, signal);
  }

  /**
   * Fetches comments on this commit.
   *
   * `GET /repos/{owner}/{repo}/commits/{commit_sha}/comments`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of commit comments
   */
  async comments(params?: CommitCommentsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubCommitComment>> {
    return this.requestList<GitHubCommitComment>(
      `${this.basePath}/comments`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Adds a comment to this commit.
   *
   * `POST /repos/{owner}/{repo}/commits/{commit_sha}/comments`
   *
   * @param data - Comment data. `body` is required.
   * @returns The created commit comment
   */
  async addComment(data: CommitCommentData, signal?: AbortSignal): Promise<GitHubCommitComment> {
    return this.requestBody<GitHubCommitComment>(`${this.basePath}/comments`, data, signal);
  }
}

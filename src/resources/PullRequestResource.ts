import type { GitHubPullRequest, PullRequestsParams } from '../domain/PullRequest';
import type { GitHubReview, GitHubReviewComment, ReviewsParams, ReviewCommentsParams } from '../domain/Review';
import type { GitHubPullRequestFile, PullRequestFilesParams } from '../domain/PullRequestFile';
import type { GitHubCommit } from '../domain/Commit';
import type { GitHubPagedResponse, PaginationParams } from '../domain/Pagination';
import type { RequestFn, RequestListFn } from './OrganizationResource';

/**
 * Represents a GitHub pull request resource with chainable async methods.
 *
 * Implements `PromiseLike<GitHubPullRequest>` so it can be awaited directly
 * to fetch the pull request info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get pull request info
 * const pr = await gh.org('github').repo('linguist').pullRequest(42);
 *
 * // Get commits in this pull request
 * const commits = await gh.org('github').repo('linguist').pullRequest(42).commits();
 *
 * // Get changed files
 * const files = await gh.org('github').repo('linguist').pullRequest(42).files();
 *
 * // Get reviews
 * const reviews = await gh.org('github').repo('linguist').pullRequest(42).reviews();
 *
 * // Get review comments (inline diff comments)
 * const comments = await gh.org('github').repo('linguist').pullRequest(42).reviewComments();
 * ```
 */
export class PullRequestResource implements PromiseLike<GitHubPullRequest> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    owner: string,
    repo: string,
    pullNumber: number,
  ) {
    this.basePath = `/repos/${owner}/${repo}/pulls/${pullNumber}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the pull request info.
   * Delegates to {@link PullRequestResource.get}.
   */
  then<TResult1 = GitHubPullRequest, TResult2 = never>(
    onfulfilled?: ((value: GitHubPullRequest) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the pull request details.
   *
   * `GET /repos/{owner}/{repo}/pulls/{pull_number}`
   *
   * @returns The pull request object
   */
  async get(signal?: AbortSignal): Promise<GitHubPullRequest> {
    return this.request<GitHubPullRequest>(this.basePath, undefined, signal);
  }

  /**
   * Fetches the commits included in this pull request.
   *
   * `GET /repos/{owner}/{repo}/pulls/{pull_number}/commits`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of commits
   */
  async commits(params?: PaginationParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubCommit>> {
    return this.requestList<GitHubCommit>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches the files changed by this pull request.
   *
   * `GET /repos/{owner}/{repo}/pulls/{pull_number}/files`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of changed files
   */
  async files(params?: PullRequestFilesParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubPullRequestFile>> {
    return this.requestList<GitHubPullRequestFile>(
      `${this.basePath}/files`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches the reviews submitted on this pull request.
   *
   * `GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews`
   *
   * @param params - Optional pagination: `per_page`, `page`
   * @returns A paged response of reviews
   */
  async reviews(params?: ReviewsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubReview>> {
    return this.requestList<GitHubReview>(
      `${this.basePath}/reviews`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Fetches the inline review comments on this pull request's diff.
   *
   * `GET /repos/{owner}/{repo}/pulls/{pull_number}/comments`
   *
   * @param params - Optional filters: `sort`, `direction`, `since`, `per_page`, `page`
   * @returns A paged response of review comments
   */
  async reviewComments(params?: ReviewCommentsParams, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubReviewComment>> {
    return this.requestList<GitHubReviewComment>(
      `${this.basePath}/comments`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Checks whether the pull request has been merged.
   *
   * `GET /repos/{owner}/{repo}/pulls/{pull_number}/merge`
   *
   * @returns `true` if merged (HTTP 204), `false` if not merged (HTTP 404)
   */
  async isMerged(signal?: AbortSignal): Promise<boolean> {
    try {
      await this.request<never>(`${this.basePath}/merge`, undefined, signal);
      return true;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') throw err;
      return false;
    }
  }
}

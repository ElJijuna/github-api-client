import type { GitHubIssue, GitHubIssueComment, UpdateIssueData } from '../domain/Issue';
import type { GitHubPagedResponse, PaginationParams } from '../domain/Pagination';
import type { RequestFn, RequestListFn, RequestBodyFn, RequestPatchFn } from './OrganizationResource';

/**
 * Represents a GitHub issue resource with chainable async methods.
 *
 * Implements `PromiseLike<GitHubIssue>` so it can be awaited directly
 * to fetch the issue info, while also exposing sub-resource methods.
 *
 * @example
 * ```typescript
 * // Await directly to get issue info
 * const issue = await gh.repo('octocat', 'Hello-World').issue(1);
 *
 * // Get comments on an issue
 * const comments = await gh.repo('octocat', 'Hello-World').issue(1).comments();
 * ```
 */
export class IssueResource implements PromiseLike<GitHubIssue> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly requestBody: RequestBodyFn,
    private readonly requestPatch: RequestPatchFn,
    owner: string,
    repo: string,
    issueNumber: number,
  ) {
    this.basePath = `/repos/${owner}/${repo}/issues/${issueNumber}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the issue info.
   * Delegates to {@link IssueResource.get}.
   */
  then<TResult1 = GitHubIssue, TResult2 = never>(
    onfulfilled?: ((value: GitHubIssue) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches the issue details.
   *
   * `GET /repos/{owner}/{repo}/issues/{issue_number}`
   *
   * @returns The issue object
   */
  async get(signal?: AbortSignal): Promise<GitHubIssue> {
    return this.request<GitHubIssue>(this.basePath, undefined, signal);
  }

  /**
   * Fetches the comments on this issue.
   *
   * `GET /repos/{owner}/{repo}/issues/{issue_number}/comments`
   *
   * @param params - Optional filters: `since`, `per_page`, `page`
   * @returns A paged response of comments
   */
  async comments(params?: PaginationParams & { since?: string }, signal?: AbortSignal): Promise<GitHubPagedResponse<GitHubIssueComment>> {
    return this.requestList<GitHubIssueComment>(
      `${this.basePath}/comments`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Adds a comment to this issue.
   *
   * `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`
   *
   * @param body - The comment text
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The created comment
   * @throws {GitHubApiError} If the issue is not found or access is denied
   *
   * @example
   * ```typescript
   * const comment = await gh.repo('octocat', 'Hello-World').issue(1).addComment('Thanks for the report!');
   * ```
   */
  async addComment(body: string, signal?: AbortSignal): Promise<GitHubIssueComment> {
    return this.requestBody<GitHubIssueComment>(`${this.basePath}/comments`, { body }, signal);
  }

  /**
   * Updates this issue.
   *
   * `PATCH /repos/{owner}/{repo}/issues/{issue_number}`
   *
   * @param data - Fields to update: `title`, `body`, `state`, `state_reason`, `assignees`, `labels`, `milestone`
   * @param signal - Optional AbortSignal to cancel the request
   * @returns The updated issue
   * @throws {GitHubApiError} If the issue is not found or access is denied
   *
   * @example
   * ```typescript
   * // Close an issue
   * await gh.repo('octocat', 'Hello-World').issue(1).update({ state: 'closed', state_reason: 'completed' });
   *
   * // Rename and reassign
   * await gh.repo('octocat', 'Hello-World').issue(1).update({ title: 'New title', assignees: ['octocat'] });
   * ```
   */
  async update(data: UpdateIssueData, signal?: AbortSignal): Promise<GitHubIssue> {
    return this.requestPatch<GitHubIssue>(this.basePath, data, signal);
  }
}

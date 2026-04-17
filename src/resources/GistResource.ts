import type { GitHubGist, GistCommit, GistFork, GistComment, GistsParams, CreateGistData, UpdateGistData, GistCommentData } from '../domain/Gist';
import type { GitHubPagedResponse } from '../domain/Pagination';
import type { RequestFn, RequestListFn, RequestBodyFn, RequestPatchFn, RequestDeleteFn, RequestPutFn } from './OrganizationResource';

/**
 * Provides access to GitHub Gist endpoints.
 *
 * Obtained via `GitHubClient.gist(gistId)` for single-gist operations,
 * or use the static list methods directly on the client.
 *
 * @example
 * ```typescript
 * const gist = await gh.gist('abc123');
 * const comments = await gh.gist('abc123').comments();
 * await gh.gist('abc123').star();
 * ```
 */
export class GistResource implements PromiseLike<GitHubGist> {
  private readonly basePath: string;

  /** @internal */
  constructor(
    private readonly request: RequestFn,
    private readonly requestList: RequestListFn,
    private readonly requestBody: RequestBodyFn,
    private readonly requestPatch: RequestPatchFn,
    private readonly requestDelete: RequestDeleteFn,
    private readonly requestPut: RequestPutFn,
    gistId: string,
  ) {
    this.basePath = `/gists/${gistId}`;
  }

  /**
   * Allows the resource to be awaited directly, resolving with the gist.
   * Delegates to {@link GistResource.get}.
   */
  then<TResult1 = GitHubGist, TResult2 = never>(
    onfulfilled?: ((value: GitHubGist) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.get().then(onfulfilled, onrejected);
  }

  /**
   * Fetches a single gist.
   *
   * `GET /gists/{gist_id}`
   */
  async get(signal?: AbortSignal): Promise<GitHubGist> {
    return this.request<GitHubGist>(this.basePath, undefined, signal);
  }

  /**
   * Updates an existing gist.
   *
   * `PATCH /gists/{gist_id}`
   */
  async update(data: UpdateGistData, signal?: AbortSignal): Promise<GitHubGist> {
    return this.requestPatch<GitHubGist>(this.basePath, data, signal);
  }

  /**
   * Deletes a gist.
   *
   * `DELETE /gists/{gist_id}`
   */
  async delete(signal?: AbortSignal): Promise<void> {
    return this.requestDelete(this.basePath, signal);
  }

  /**
   * Lists commits for a gist.
   *
   * `GET /gists/{gist_id}/commits`
   */
  async commits(params?: { per_page?: number; page?: number }, signal?: AbortSignal): Promise<GitHubPagedResponse<GistCommit>> {
    return this.requestList<GistCommit>(
      `${this.basePath}/commits`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Forks a gist.
   *
   * `POST /gists/{gist_id}/forks`
   */
  async fork(signal?: AbortSignal): Promise<GitHubGist> {
    return this.requestBody<GitHubGist>(`${this.basePath}/forks`, {}, signal);
  }

  /**
   * Lists forks of a gist.
   *
   * `GET /gists/{gist_id}/forks`
   */
  async forks(params?: { per_page?: number; page?: number }, signal?: AbortSignal): Promise<GitHubPagedResponse<GistFork>> {
    return this.requestList<GistFork>(
      `${this.basePath}/forks`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Stars a gist for the authenticated user.
   *
   * `PUT /gists/{gist_id}/star`
   */
  async star(signal?: AbortSignal): Promise<void> {
    return this.requestPut(`${this.basePath}/star`, signal);
  }

  /**
   * Unstars a gist for the authenticated user.
   *
   * `DELETE /gists/{gist_id}/star`
   */
  async unstar(signal?: AbortSignal): Promise<void> {
    return this.requestDelete(`${this.basePath}/star`, signal);
  }

  /**
   * Checks whether the authenticated user has starred a gist.
   * Returns `true` if starred (HTTP 204), `false` if not (HTTP 404).
   *
   * `GET /gists/{gist_id}/star`
   */
  async isStarred(signal?: AbortSignal): Promise<boolean> {
    try {
      await this.request<void>(`${this.basePath}/star`, undefined, signal);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Lists comments on a gist.
   *
   * `GET /gists/{gist_id}/comments`
   */
  async comments(params?: { per_page?: number; page?: number }, signal?: AbortSignal): Promise<GitHubPagedResponse<GistComment>> {
    return this.requestList<GistComment>(
      `${this.basePath}/comments`,
      params as Record<string, string | number | boolean>,
      signal,
    );
  }

  /**
   * Creates a comment on a gist.
   *
   * `POST /gists/{gist_id}/comments`
   */
  async addComment(data: GistCommentData, signal?: AbortSignal): Promise<GistComment> {
    return this.requestBody<GistComment>(`${this.basePath}/comments`, data, signal);
  }

  /**
   * Updates a comment on a gist.
   *
   * `PATCH /gists/{gist_id}/comments/{comment_id}`
   */
  async updateComment(commentId: number, data: GistCommentData, signal?: AbortSignal): Promise<GistComment> {
    return this.requestPatch<GistComment>(`${this.basePath}/comments/${commentId}`, data, signal);
  }

  /**
   * Deletes a comment on a gist.
   *
   * `DELETE /gists/{gist_id}/comments/{comment_id}`
   */
  async deleteComment(commentId: number, signal?: AbortSignal): Promise<void> {
    return this.requestDelete(`${this.basePath}/comments/${commentId}`, signal);
  }
}

export type { GistsParams, CreateGistData, UpdateGistData, GistCommentData };

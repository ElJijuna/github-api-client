import type { PaginationParams } from './Pagination';
import type { GitHubUser } from './User';

/**
 * Represents a pull request review submitted by a reviewer.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/reviews#get-a-review-for-a-pull-request}
 */
export interface GitHubReview {
  /** Unique numeric review ID */
  id: number;
  /** User who submitted the review */
  user: GitHubUser;
  /** Review body text */
  body: string;
  /** Review state */
  state: 'APPROVED' | 'CHANGES_REQUESTED' | 'COMMENTED' | 'DISMISSED' | 'PENDING';
  /** URL to the review on GitHub */
  html_url: string;
  /** ISO 8601 timestamp of submission */
  submitted_at: string;
  /** The commit SHA this review was submitted against */
  commit_id: string;
}

/**
 * Represents a review comment on a specific line of a pull request diff.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/comments#get-a-review-comment-for-a-pull-request}
 */
export interface GitHubReviewComment {
  /** Unique numeric comment ID */
  id: number;
  /** User who wrote the comment */
  user: GitHubUser;
  /** Comment body text */
  body: string;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** URL to the comment on GitHub */
  html_url: string;
  /** Path to the file this comment is on */
  path: string;
  /** Line position in the diff */
  position: number | null;
  /** The diff hunk this comment refers to */
  diff_hunk: string;
  /** The commit SHA this comment was placed on */
  commit_id: string;
  /** ID of the parent comment if this is a reply */
  in_reply_to_id?: number;
  /** ID of the review this comment belongs to */
  pull_request_review_id: number;
  /** Line number in the file */
  line?: number;
  /** Side of the diff (`LEFT` for old file, `RIGHT` for new file) */
  side?: 'LEFT' | 'RIGHT';
}

/**
 * Query parameters for listing pull request reviews.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/reviews#list-reviews-for-a-pull-request}
 */
export interface ReviewsParams extends PaginationParams {}

/**
 * Query parameters for listing review comments.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/comments#list-review-comments-on-a-pull-request}
 */
export interface ReviewCommentsParams extends PaginationParams {
  /** Sort field */
  sort?: 'created' | 'updated';
  /** Sort direction */
  direction?: 'asc' | 'desc';
  /** Only return comments after this ISO 8601 date */
  since?: string;
}

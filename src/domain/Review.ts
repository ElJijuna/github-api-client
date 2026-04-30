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
 * Request body for submitting a pull request review.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/reviews#create-a-review-for-a-pull-request}
 */
export interface CreateReviewData {
  /** The SHA of the commit to review (defaults to the latest) */
  commit_id?: string;
  /** The review body text */
  body?: string;
  /** The review action */
  event: 'APPROVE' | 'REQUEST_CHANGES' | 'COMMENT';
  /** Inline comments to include with the review */
  comments?: Array<{
    path: string;
    position?: number;
    body: string;
    line?: number;
    side?: 'LEFT' | 'RIGHT';
  }>;
}

/**
 * Request body for adding an inline diff comment to a pull request.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/comments#create-a-review-comment-for-a-pull-request}
 */
export interface AddCommentData {
  /** The comment text */
  body: string;
  /** The SHA of the commit to comment on */
  commit_id: string;
  /** Relative path of the file to comment on */
  path: string;
  /** Line index in the diff (deprecated in favour of `line`) */
  position?: number;
  /** Line number in the file */
  line?: number;
  /** Side of the diff */
  side?: 'LEFT' | 'RIGHT';
  /** First line of a multi-line comment */
  start_line?: number;
  /** Side for the first line of a multi-line comment */
  start_side?: 'LEFT' | 'RIGHT';
  /** ID of the comment to reply to */
  in_reply_to?: number;
}

/**
 * Request body for requesting reviewers on a pull request.
 *
 * @see {@link https://docs.github.com/en/rest/pulls/review-requests#request-reviewers-for-a-pull-request}
 */
export interface RequestReviewersData {
  /** GitHub logins of the reviewers to request */
  reviewers?: string[];
  /** Team slugs to request */
  team_reviewers?: string[];
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

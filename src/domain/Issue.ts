import type { PaginationParams } from './Pagination';
import type { GitHubUser } from './User';
import type { GitHubLabel, GitHubMilestone } from './PullRequest';

/**
 * Represents a GitHub issue.
 *
 * Note: GitHub's API returns pull requests as issues when listing. Check for
 * the presence of `pull_request` to distinguish them.
 *
 * @see {@link https://docs.github.com/en/rest/issues/issues#get-an-issue}
 */
export interface GitHubIssue {
  /** Unique numeric issue ID (global across GitHub) */
  id: number;
  /** Issue number within the repository */
  number: number;
  /** Issue title */
  title: string;
  /** Issue body */
  body: string | null;
  /** Current state */
  state: 'open' | 'closed';
  /** Whether the issue is locked */
  locked: boolean;
  /** Issue author */
  user: GitHubUser;
  /** Users assigned to this issue */
  assignees: GitHubUser[];
  /** Labels applied to this issue */
  labels: GitHubLabel[];
  /** Milestone, if any */
  milestone: GitHubMilestone | null;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** ISO 8601 timestamp of closing */
  closed_at: string | null;
  /** Number of comments */
  comments: number;
  /** URL to the issue on GitHub */
  html_url: string;
  /** Present when this issue is actually a pull request */
  pull_request?: {
    url: string;
    html_url: string;
    merged_at: string | null;
  };
  /** User who closed the issue */
  closed_by?: GitHubUser | null;
}

/**
 * Represents a comment on a GitHub issue.
 *
 * @see {@link https://docs.github.com/en/rest/issues/comments#get-an-issue-comment}
 */
export interface GitHubIssueComment {
  /** Unique numeric comment ID */
  id: number;
  /** Comment body */
  body: string;
  /** User who wrote the comment */
  user: GitHubUser;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** URL to the comment on GitHub */
  html_url: string;
}

/**
 * Query parameters for listing issues.
 *
 * @see {@link https://docs.github.com/en/rest/issues/issues#list-repository-issues}
 */
export interface IssuesParams extends PaginationParams {
  /** Filter by milestone number, `'*'` (any), or `'none'` */
  milestone?: string | number;
  /** Filter by state */
  state?: 'open' | 'closed' | 'all';
  /** Filter by assignee login, `'*'` (any), or `'none'` */
  assignee?: string;
  /** Filter by author login */
  creator?: string;
  /** Filter by user mentioned */
  mentioned?: string;
  /** Filter by comma-separated label names */
  labels?: string;
  /** Sort field */
  sort?: 'created' | 'updated' | 'comments';
  /** Sort direction */
  direction?: 'asc' | 'desc';
  /** Only return issues updated after this ISO 8601 date */
  since?: string;
}

/**
 * Request body for creating an issue.
 *
 * @see {@link https://docs.github.com/en/rest/issues/issues#create-an-issue}
 */
export interface CreateIssueData {
  /** Issue title (required) */
  title: string;
  /** Issue body */
  body?: string;
  /** Assignee logins */
  assignees?: string[];
  /** Milestone number */
  milestone?: number;
  /** Label names */
  labels?: string[];
}

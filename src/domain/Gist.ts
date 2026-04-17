import type { GitHubUser } from './User';
import type { PaginationParams } from './Pagination';

/**
 * Represents a single file within a GitHub Gist.
 */
export interface GistFile {
  /** File name */
  filename: string;
  /** MIME type of the file */
  type: string;
  /** Programming language detected */
  language: string | null;
  /** URL to fetch the raw file content */
  raw_url: string;
  /** File size in bytes */
  size: number;
  /** File content (only present in single-gist responses) */
  content?: string;
  /** Whether the file content was truncated */
  truncated?: boolean;
}

/**
 * Represents a GitHub Gist.
 */
export interface GitHubGist {
  /** Unique gist ID */
  id: string;
  /** Short description of the gist */
  description: string | null;
  /** Whether the gist is public */
  public: boolean;
  /** Owner of the gist */
  owner: GitHubUser | null;
  /** User who forked this gist, if applicable */
  user: GitHubUser | null;
  /** Map of filename to file metadata */
  files: Record<string, GistFile>;
  /** Number of comments */
  comments: number;
  /** URL to the gist's comments API */
  comments_url: string;
  /** GitHub web URL for the gist */
  html_url: string;
  /** Git pull URL */
  git_pull_url: string;
  /** Git push URL */
  git_push_url: string;
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** ISO 8601 last-update timestamp */
  updated_at: string;
  /** Node ID */
  node_id: string;
  /** Whether the authenticated user has starred this gist */
  starred?: boolean;
  /** Fork metadata, if this is a fork */
  fork_of?: GitHubGist | null;
  /** Number of forks */
  forks_url?: string;
  /** Number of commits */
  commits_url?: string;
}

/**
 * Represents a single commit in a gist's history.
 */
export interface GistCommit {
  /** The commit URL */
  url: string;
  /** The commit version (SHA) */
  version: string;
  /** The user who made this commit */
  user: GitHubUser | null;
  /** Change status for this commit */
  change_status: {
    total: number;
    additions: number;
    deletions: number;
  };
  /** ISO 8601 committed timestamp */
  committed_at: string;
}

/**
 * Represents a fork of a gist.
 */
export interface GistFork {
  /** Unique gist ID of the fork */
  id: string;
  /** Owner of the fork */
  user: GitHubUser;
  /** GitHub web URL of the fork */
  html_url: string;
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** ISO 8601 last-update timestamp */
  updated_at: string;
}

/**
 * Represents a comment on a gist.
 */
export interface GistComment {
  /** Unique comment ID */
  id: number;
  /** The comment body */
  body: string;
  /** Author of the comment */
  user: GitHubUser | null;
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** ISO 8601 last-update timestamp */
  updated_at: string;
}

/**
 * Query parameters for listing gists.
 */
export interface GistsParams extends PaginationParams {
  /** Only gists updated after this ISO 8601 timestamp */
  since?: string;
}

/**
 * File entry for creating or updating a gist.
 */
export interface GistFileInput {
  /** File content */
  content: string;
  /** New filename (used when renaming during update) */
  filename?: string;
}

/**
 * Body for creating a new gist.
 */
export interface CreateGistData {
  /** Map of filename to file input */
  files: Record<string, GistFileInput>;
  /** Short description */
  description?: string;
  /** Whether the gist should be public */
  public?: boolean;
}

/**
 * Body for updating an existing gist.
 */
export interface UpdateGistData {
  /** Map of filename to file input. Set content to empty string to delete a file. */
  files?: Record<string, GistFileInput | null>;
  /** Updated description */
  description?: string;
}

/**
 * Body for creating or updating a gist comment.
 */
export interface GistCommentData {
  /** The comment body */
  body: string;
}

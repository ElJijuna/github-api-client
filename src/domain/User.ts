import type { PaginationParams } from './Pagination';

/**
 * Represents a GitHub user or bot.
 * This is the minimal user object embedded in other responses (e.g., repository owner, PR author).
 */
export interface GitHubUser {
  /** Unique numeric user ID */
  id: number;
  /** The user's login name (e.g., `'octocat'`) */
  login: string;
  /** Display name, may be null for users who have not set one */
  name: string | null;
  /** Public email address, may be null */
  email: string | null;
  /** URL to the user's avatar image */
  avatar_url: string;
  /** URL to the user's GitHub profile page */
  html_url: string;
  /** Account type */
  type: 'User' | 'Organization' | 'Bot';
  /** Whether the user is a GitHub site administrator */
  site_admin: boolean;
  /** The user's company affiliation */
  company?: string | null;
  /** The user's biography */
  bio?: string | null;
  /** The user's location */
  location?: string | null;
  /** Number of public repositories */
  public_repos?: number;
  /** Number of public gists */
  public_gists?: number;
  /** Number of followers */
  followers?: number;
  /** Number of accounts the user follows */
  following?: number;
  /** ISO 8601 timestamp of account creation */
  created_at?: string;
  /** ISO 8601 timestamp of last profile update */
  updated_at?: string;
}

/**
 * Query parameters accepted by `GET /users` (list all users).
 *
 * @see {@link https://docs.github.com/en/rest/users/users#list-users}
 */
export interface UsersParams {
  /** The integer ID of the last user seen */
  since?: number;
  /** Results per page (max 100) */
  per_page?: number;
}

/**
 * Query parameters accepted by `GET /search/users`.
 *
 * @see {@link https://docs.github.com/en/rest/search/search#search-users}
 */
export interface SearchUsersParams extends PaginationParams {
  /** Search query (required) */
  q: string;
  /** Sort field */
  sort?: 'followers' | 'repositories' | 'joined';
  /** Sort direction */
  order?: 'asc' | 'desc';
}

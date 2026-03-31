import type { PaginationParams } from './Pagination';

/**
 * Represents a GitHub organization.
 *
 * @see {@link https://docs.github.com/en/rest/orgs/orgs#get-an-organization}
 */
export interface GitHubOrganization {
  /** Unique numeric organization ID */
  id: number;
  /** The organization's login name (e.g., `'github'`) */
  login: string;
  /** Display name */
  name: string | null;
  /** Organization description */
  description: string | null;
  /** URL to the organization's avatar image */
  avatar_url: string;
  /** URL to the organization's GitHub page */
  html_url: string;
  /** API URL for the organization's repositories */
  repos_url: string;
  /** Number of public repositories */
  public_repos: number;
  /** Number of public gists */
  public_gists: number;
  /** Number of followers */
  followers: number;
  /** Number of accounts the org follows */
  following: number;
  /** ISO 8601 timestamp of organization creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** Account type — always `'Organization'` */
  type: 'Organization';
  /** Whether this is a verified organization */
  is_verified?: boolean;
  /** Number of private repositories (requires admin scope) */
  total_private_repos?: number;
  /** Total number of members */
  members_count?: number;
}

/**
 * Query parameters for listing organization members.
 *
 * @see {@link https://docs.github.com/en/rest/orgs/members#list-organization-members}
 */
export interface OrgMembersParams extends PaginationParams {
  /** Filter members by role */
  role?: 'all' | 'admin' | 'member';
  /** Filter members by public visibility */
  filter?: 'all' | '2fa_disabled';
}

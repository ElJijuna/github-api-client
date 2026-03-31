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
 * Request body for creating a repository in an organization.
 *
 * @see {@link https://docs.github.com/en/rest/repos/repos#create-an-organization-repository}
 */
export interface CreateOrgRepoData {
  /** Repository name (required) */
  name: string;
  /** Repository description */
  description?: string;
  /** Homepage URL */
  homepage?: string;
  /** Whether the repository is private. Defaults to `false`. */
  private?: boolean;
  /** Repository visibility. Overrides `private` when provided. */
  visibility?: 'public' | 'private' | 'internal';
  /** Whether to enable issues. Defaults to `true`. */
  has_issues?: boolean;
  /** Whether to enable projects. Defaults to `true`. */
  has_projects?: boolean;
  /** Whether to enable the wiki. Defaults to `true`. */
  has_wiki?: boolean;
  /** Whether to enable discussions. Defaults to `false`. */
  has_discussions?: boolean;
  /** Whether to initialize the repository with a README. Defaults to `false`. */
  auto_init?: boolean;
  /** `.gitignore` template to apply (e.g., `'Node'`) */
  gitignore_template?: string;
  /** License template to apply (e.g., `'mit'`) */
  license_template?: string;
  /** Whether to allow squash-merging pull requests. Defaults to `true`. */
  allow_squash_merge?: boolean;
  /** Whether to allow merge commits. Defaults to `true`. */
  allow_merge_commit?: boolean;
  /** Whether to allow rebase-merging pull requests. Defaults to `true`. */
  allow_rebase_merge?: boolean;
  /** Whether to automatically delete head branches after pull requests are merged. Defaults to `false`. */
  delete_branch_on_merge?: boolean;
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

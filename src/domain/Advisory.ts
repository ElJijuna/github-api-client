import type { PaginationParams } from './Pagination';
import type { GitHubUser } from './User';
import type { GitHubRepository } from './Repository';

/**
 * A package affected by an advisory vulnerability.
 */
export interface GitHubAdvisoryVulnerability {
  /** The affected package */
  package: { ecosystem: string; name: string } | null;
  /** Severity of this specific vulnerability */
  severity: string | null;
  /** Semver range of vulnerable versions */
  vulnerable_version_range: string | null;
  /** First version that contains the fix */
  first_patched_version: { identifier: string } | null;
}

/**
 * Represents a global advisory from the GitHub Advisory Database.
 *
 * @see {@link https://docs.github.com/en/rest/security-advisories/global-advisories#get-a-global-security-advisory}
 */
export interface GitHubAdvisory {
  /** GitHub Security Advisory ID (e.g., `'GHSA-xxxx-xxxx-xxxx'`) */
  ghsa_id: string;
  /** CVE identifier, if assigned */
  cve_id: string | null;
  /** API URL */
  url: string;
  /** URL to the advisory on GitHub */
  html_url: string;
  /** Short summary */
  summary: string;
  /** Full description */
  description: string;
  /** Advisory type */
  type: string;
  /** Overall severity */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  /** URL to source code related to the advisory */
  source_code_location: string | null;
  /** External identifiers (CVE, GHSA, etc.) */
  identifiers: Array<{ type: string; value: string }>;
  /** External reference URLs */
  references: string[];
  /** ISO 8601 publication timestamp */
  published_at: string;
  /** ISO 8601 last-updated timestamp */
  updated_at: string;
  /** ISO 8601 withdrawal timestamp, or `null` if still active */
  withdrawn_at: string | null;
  /** Affected packages and version ranges */
  vulnerabilities: GitHubAdvisoryVulnerability[];
  /** CVSS score and vector string */
  cvss: { score: number; vector_string: string } | null;
  /** CWE classifications */
  cwes: Array<{ cwe_id: string; name: string }> | null;
  /** Credits for discovering/reporting */
  credits: Array<{ user: GitHubUser; type: string }> | null;
}

/**
 * Query parameters for listing global advisories.
 *
 * @see {@link https://docs.github.com/en/rest/security-advisories/global-advisories#list-global-security-advisories}
 */
export interface AdvisoriesParams extends PaginationParams {
  /** Filter by GHSA ID */
  ghsa_id?: string;
  /** Filter by CVE ID */
  cve_id?: string;
  /** Filter by ecosystem (e.g., `'npm'`, `'pip'`) */
  ecosystem?: string;
  /** Filter by severity */
  severity?: 'unknown' | 'low' | 'medium' | 'high' | 'critical';
  /** Filter by CWE ID */
  cwe_id?: string;
  /** Whether to include withdrawn advisories */
  is_withdrawn?: boolean;
  /** Sort field */
  sort?: 'updated' | 'published';
  /** Sort direction */
  direction?: 'asc' | 'desc';
}

/**
 * Represents a security advisory scoped to a repository.
 *
 * @see {@link https://docs.github.com/en/rest/security-advisories/repository-advisories#get-a-repository-security-advisory}
 */
export interface GitHubRepositoryAdvisory {
  /** GitHub Security Advisory ID */
  ghsa_id: string;
  /** CVE identifier, if assigned */
  cve_id: string | null;
  /** API URL */
  url: string;
  /** URL to the advisory on GitHub */
  html_url: string;
  /** Short summary */
  summary: string;
  /** Full description */
  description: string;
  /** Overall severity */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  /** User who authored the advisory draft */
  author: GitHubUser;
  /** User who published the advisory */
  publisher: GitHubUser | null;
  /** External identifiers */
  identifiers: Array<{ type: string; value: string }>;
  /** Advisory lifecycle state */
  state: 'published' | 'closed' | 'withdrawn' | 'draft' | 'triage';
  /** ISO 8601 creation timestamp */
  created_at: string;
  /** ISO 8601 last-updated timestamp */
  updated_at: string;
  /** ISO 8601 publication timestamp, or `null` if not yet published */
  published_at: string | null;
  /** ISO 8601 closure timestamp, or `null` if still open */
  closed_at: string | null;
  /** ISO 8601 withdrawal timestamp, or `null` if not withdrawn */
  withdrawn_at: string | null;
  /** CVE submission status */
  submission: { accepted: boolean } | null;
  /** Affected packages and version ranges */
  vulnerabilities: GitHubAdvisoryVulnerability[];
  /** CVSS score and vector string */
  cvss: { score: number; vector_string: string } | null;
  /** CWE classifications */
  cwes: Array<{ cwe_id: string; name: string }> | null;
  /** Credited researchers/reporters */
  credits: Array<{ login: string; type: string }> | null;
  /** Credited researchers with detailed info */
  credits_detailed: Array<{ user: GitHubUser; type: string; state: string }> | null;
  /** Users collaborating on this advisory */
  collaborating_users: GitHubUser[] | null;
  /** Teams collaborating on this advisory */
  collaborating_teams: Array<{ name: string; slug: string }> | null;
  /** Private fork created for this advisory */
  private_fork: GitHubRepository | null;
}

/**
 * Query parameters for listing repository advisories.
 *
 * @see {@link https://docs.github.com/en/rest/security-advisories/repository-advisories#list-repository-security-advisories}
 */
export interface RepoAdvisoriesParams extends PaginationParams {
  /** Sort direction */
  direction?: 'asc' | 'desc';
  /** Sort field */
  sort?: 'created' | 'updated' | 'published';
  /** Filter by state */
  state?: 'triage' | 'draft' | 'published' | 'closed';
}

/**
 * Vulnerability entry for creating or updating a repository advisory.
 */
export interface AdvisoryVulnerabilityInput {
  /** The affected package */
  package: { ecosystem: string; name?: string };
  /** Semver range of vulnerable versions */
  vulnerable_version_range?: string;
  /** Semver range of patched versions */
  patched_versions?: string;
  /** Vulnerable function names */
  vulnerable_functions?: string[];
}

/**
 * Request body for creating a repository advisory draft.
 *
 * @see {@link https://docs.github.com/en/rest/security-advisories/repository-advisories#create-a-repository-security-advisory}
 */
export interface CreateAdvisoryData {
  /** Short summary (required) */
  summary: string;
  /** Full description (required) */
  description: string;
  /** Severity level */
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  /** CVE ID to associate */
  cve_id?: string;
  /** Affected packages and versions */
  vulnerabilities?: AdvisoryVulnerabilityInput[];
  /** CWE IDs to associate */
  cwe_ids?: string[];
  /** Credits to assign */
  credits?: Array<{ login: string; type: string }>;
}

/**
 * Request body for updating a repository advisory.
 *
 * @see {@link https://docs.github.com/en/rest/security-advisories/repository-advisories#update-a-repository-security-advisory}
 */
export interface UpdateAdvisoryData {
  /** New summary */
  summary?: string;
  /** New description */
  description?: string;
  /** New severity */
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'unknown';
  /** CVE ID to associate */
  cve_id?: string;
  /** Updated affected packages and versions */
  vulnerabilities?: AdvisoryVulnerabilityInput[];
  /** Updated CWE IDs */
  cwe_ids?: string[];
  /** Updated credits */
  credits?: Array<{ login: string; type: string }>;
  /** New state */
  state?: 'published' | 'closed' | 'draft';
}

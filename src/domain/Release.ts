import type { PaginationParams } from './Pagination';
import type { GitHubUser } from './User';

/**
 * Represents a release asset (a file attached to a GitHub release).
 */
export interface GitHubReleaseAsset {
  /** Unique numeric asset ID */
  id: number;
  /** Asset filename */
  name: string;
  /** Asset label */
  label: string | null;
  /** MIME content type */
  content_type: string;
  /** File size in bytes */
  size: number;
  /** Total number of downloads */
  download_count: number;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** Browser download URL */
  browser_download_url: string;
  /** User who uploaded the asset */
  uploader: GitHubUser;
}

/**
 * Represents a GitHub release.
 *
 * @see {@link https://docs.github.com/en/rest/releases/releases#get-a-release}
 */
export interface GitHubRelease {
  /** Unique numeric release ID */
  id: number;
  /** The tag this release is associated with (e.g., `'v1.0.0'`) */
  tag_name: string;
  /** Release title */
  name: string | null;
  /** Release description / changelog */
  body: string | null;
  /** Whether this is a draft release */
  draft: boolean;
  /** Whether this is a pre-release */
  prerelease: boolean;
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of publishing (null for drafts) */
  published_at: string | null;
  /** User who created the release */
  author: GitHubUser;
  /** URL to the release on GitHub */
  html_url: string;
  /** URL to download the source as a tar archive */
  tarball_url: string;
  /** URL to download the source as a zip archive */
  zipball_url: string;
  /** Files attached to this release */
  assets: GitHubReleaseAsset[];
}

/**
 * Query parameters for listing releases.
 *
 * @see {@link https://docs.github.com/en/rest/releases/releases#list-releases}
 */
export interface ReleasesParams extends PaginationParams {}

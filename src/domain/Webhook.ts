import type { PaginationParams } from './Pagination';

/**
 * Represents a GitHub repository webhook.
 *
 * @see {@link https://docs.github.com/en/rest/webhooks/repos#get-a-repository-webhook}
 */
export interface GitHubWebhook {
  /** Unique numeric webhook ID */
  id: number;
  /** Webhook name — always `'web'` for repository webhooks */
  name: string;
  /** Whether the webhook is active */
  active: boolean;
  /** List of events that trigger this webhook */
  events: string[];
  /** Webhook configuration */
  config: {
    /** Payload delivery URL */
    url: string;
    /** Payload format (`'json'` or `'form'`) */
    content_type?: string;
    /** Whether SSL verification is disabled (`'0'` = disabled, `'1'` = enabled) */
    insecure_ssl?: string;
    /** HMAC secret for payload verification */
    secret?: string;
  };
  /** ISO 8601 timestamp of creation */
  created_at: string;
  /** ISO 8601 timestamp of last update */
  updated_at: string;
  /** URL to ping this webhook */
  ping_url: string;
  /** URL to list webhook deliveries */
  deliveries_url: string;
}

/**
 * Query parameters for listing webhooks.
 *
 * @see {@link https://docs.github.com/en/rest/webhooks/repos#list-repository-webhooks}
 */
export interface WebhooksParams extends PaginationParams {}

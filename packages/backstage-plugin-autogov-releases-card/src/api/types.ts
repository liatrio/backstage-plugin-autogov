/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

export interface ReleaseData {
  name: string;
  tag: string;
  url: string;
  publishedAt: string;
  autogovAssetUrl?: string;
  autogovStatus?: string;
  autogovFailedPolicies?: any[];
}

/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
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

export interface ReleaseData {
  name: string;
  tag: string;
  url: string;
  publishedAt: string;
  autogovAssetUrl?: string;
  autogovStatus?: string;
  autogovFailedPolicies?: any[];
}

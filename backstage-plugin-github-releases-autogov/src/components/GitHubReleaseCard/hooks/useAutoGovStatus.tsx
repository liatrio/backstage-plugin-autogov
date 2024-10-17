import { useState, useEffect, useCallback } from "react";
import {
  useApi,
  githubAuthApiRef,
  configApiRef,
} from "@backstage/core-plugin-api";
import { Octokit } from "@octokit/rest";

interface ReleaseData {
  id: number;
  autoGovStatus: string;
  failedPolicies: string;
}

const useAutoGovStatus = (
  owner: string,
  repo: string,
  releaseIds: number[],
) => {
  const [data, setData] = useState<ReleaseData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const auth = useApi(githubAuthApiRef);
  const configApi = useApi(configApiRef);
  const backendUrl = configApi.getString("backend.baseUrl");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await auth.getAccessToken(["repo"]);
      const octokit = new Octokit({ auth: token });

      const fetchedData = await Promise.all(
        releaseIds.map(async (releaseId) => {
          try {
            const response = await octokit.rest.repos.getRelease({
              owner,
              repo,
              release_id: releaseId,
            });

            if (response.status !== 200 && response.status !== 302) {
              throw new Error(
                `Failed to fetch release ${releaseId}: ${response.status}`,
              );
            }

            const releaseAssets = response.data.assets;
            const resultsAsset = releaseAssets.find((asset) =>
              asset.name.includes("results"),
            );

            if (!resultsAsset) {
              return {
                id: releaseId,
                autoGovStatus: "n/a",
                failedPolicies: "n/a",
              };
            }

            const assetUrl = resultsAsset.url;

            // fetch the release asset data from resultAsset.url with header Accept: application/octet-stream
            // const assetResponse = await fetch(assetUrl, {
            //   headers: {
            //     Authorization: `Bearer ${token}`,
            //     Accept: 'application/octet-stream', // GitHub API requires this header for downloading assets
            //   },
            // });

            // Call the Backstage proxy to fetch the release asset data as a workaround
            // for CORS blocked by GitHub when fetching releases/assets/assetId with header Accept: application/octet-stream
            const assetResponse = await fetch(
              `${backendUrl}/api/github-releases-assets-backend/releases-assets?assetUrl=${assetUrl}`,
            );

            if (!assetResponse.ok) {
              return {
                id: releaseId,
                autoGovStatus: "n/a",
                failedPolicies: "n/a",
              };
            }

            const resultsData = await assetResponse.json();

            return {
              id: releaseId,
              autoGovStatus: resultsData.result || "n/a",
              failedPolicies: resultsData.violations || "n/a",
            };
          } catch (err) {
            return {
              id: releaseId,
              autoGovStatus: "n/a",
              failedPolicies: "n/a",
            };
          }
        }),
      );

      setData(fetchedData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, releaseIds, auth, backendUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
};

export default useAutoGovStatus;

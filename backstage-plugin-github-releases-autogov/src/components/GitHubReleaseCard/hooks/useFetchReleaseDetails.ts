import { useApi, githubAuthApiRef } from "@backstage/core-plugin-api";
import { useState, useEffect } from "react";
import axios from "axios";

type Release = {
  id: number;
  html_url: string;
  tag_name: string;
  prerelease: boolean;
  name: string;
  autoGovStatus?: string;
  failedPolicies?: string;
};

type ReleaseDetails = {
  autoGovStatus: string;
  failedPolicies: string;
};

const GITHUB_API_URL = "https://api.github.com";

const getReleaseAssetId = async (
  release: Release,
  token: string,
): Promise<number | null> => {
  const repoPath = release.html_url.split("/").slice(3, 5).join("/");
  const apiUrl = `${GITHUB_API_URL}/repos/${repoPath}/releases/tags/${release.tag_name}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const assets = response.data.assets;
    const releaseAsset = assets.find((asset: any) => asset.name === "results");
    return releaseAsset ? releaseAsset.id : null;
  } catch (error) {
    return null;
  }
};

const fetchReleaseDetails = async (
  release: Release,
  token: string,
): Promise<ReleaseDetails> => {
  const assetId = await getReleaseAssetId(release, token);
  if (!assetId) {
    return {
      autoGovStatus: "Unknown",
      failedPolicies: "None",
    };
  }

  const apiUrl = `${GITHUB_API_URL}/repos/${release.html_url.split("/").slice(3, 5).join("/")}/releases/assets/${assetId}`;

  try {
    const response = await axios.get(apiUrl, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    const data = response.data;
    return {
      autoGovStatus: data.result || "Unknown",
      failedPolicies: data.violations.length
        ? data.violations.join(", ")
        : "None",
    };
  } catch (error) {
    return {
      autoGovStatus: "Unknown",
      failedPolicies: "None",
    };
  }
};

export const useFetchReleaseDetails = (release: Release) => {
  const auth = useApi(githubAuthApiRef);
  const [details, setDetails] = useState<ReleaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await auth.getAccessToken(["repo"]);
        const releaseDetails = await fetchReleaseDetails(release, token);
        setDetails(releaseDetails);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [release, auth]);

  return { details, loading, error };
};

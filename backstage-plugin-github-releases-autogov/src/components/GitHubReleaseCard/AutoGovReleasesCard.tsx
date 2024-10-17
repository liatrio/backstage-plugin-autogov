import React, { useMemo } from "react";
import styled from "styled-components";
import { Link, Chip, Typography } from "@material-ui/core";
import LocalOfferOutlinedIcon from "@material-ui/icons/LocalOfferOutlined";
import Alert from "@material-ui/lab/Alert";
import {
  InfoCard,
  Progress,
  MissingAnnotationEmptyState,
} from "@backstage/core-components";
import { useRequest } from "./hooks/useRequest";
import { useEntityGithubScmIntegration } from "./hooks/useEntityGithubScmIntegration";
import { useProjectEntity } from "./hooks/useProjectEntity";
import {
  isGithubInsightsAvailable,
  GITHUB_INSIGHTS_ANNOTATION,
} from "./utils/isGithubInsightsAvailable";
import { useEntity } from "@backstage/plugin-catalog-react";
import { styles as useStyles } from "./utils/styles";
import useAutoGovStatus from "./hooks/useAutoGovStatus";

const FailedPoliciesList = styled.div`
  display: flex;
  flex-direction: column;
`;

const PolicyItem = styled.div`
  margin-bottom: 8px;
`;

const InfoButton = styled.span`
  margin-left: 8px;
  position: relative;
  cursor: pointer;

  &:hover .tooltip {
    display: inline-block;
  }
`;

const Tooltip = styled.span`
  display: none;
  position: absolute;
  right: 100%;
  margin-right: 8px;
  background-color: #555;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 1;
`;

type Release = {
  id: number;
  html_url: string;
  tag_name: string;
  prerelease: boolean;
  name: string;
  autoGovStatus?: string;
  failedPolicies?: { policy: string; message: string }[];
};

const renderFailedPolicies = (release: Release) => {
  if (release.autoGovStatus === "PASSED") {
    return "none";
  }

  if (
    Array.isArray(release.failedPolicies) &&
    release.failedPolicies.length > 0
  ) {
    return (
      <FailedPoliciesList>
        {release.failedPolicies.map((policy) => (
          <PolicyItem key={`${release.id}-${policy.policy}`}>
            {policy.policy}
            <InfoButton>
              ℹ️
              <Tooltip className="tooltip">{policy.message}</Tooltip>
            </InfoButton>
          </PolicyItem>
        ))}
      </FailedPoliciesList>
    );
  }

  return "n/a";
};

const ReleasesCard = () => {
  const classes = useStyles();
  const { entity } = useEntity();

  const { owner, repo } = useProjectEntity(entity);
  const { value, loading, error } = useRequest(entity, "releases", 0, 5);
  const { hostname } = useEntityGithubScmIntegration(entity);

  // Memoize releaseIds to ensure it is not recreated on every render
  const releaseIds = useMemo(
    () => (value ? value.map((release: Release) => release.id) : []),
    [value],
  );

  const {
    data: autoGovData,
    loading: autoGovLoading,
    error: autoGovError,
  } = useAutoGovStatus(owner, repo, releaseIds);

  const projectAlert = isGithubInsightsAvailable(entity);
  if (!projectAlert) {
    return (
      <MissingAnnotationEmptyState annotation={GITHUB_INSIGHTS_ANNOTATION} />
    );
  }

  if (loading || autoGovLoading) {
    return <Progress />;
  } else if (error || autoGovError) {
    return (
      <Alert severity="error" className={classes.infoCard}>
        {error?.message || autoGovError?.message}
      </Alert>
    );
  }

  const enhancedReleases = value.map((release: Release) => {
    const autoGovInfo = autoGovData.find((data) => data.id === release.id);
    return {
      ...release,
      autoGovStatus: autoGovInfo?.autoGovStatus,
      failedPolicies: autoGovInfo?.failedPolicies,
    };
  });

  return enhancedReleases.length && owner && repo ? (
    <InfoCard
      title="GitHub Releases"
      deepLink={{
        link: `https://${hostname}/${owner}/${repo}/releases`,
        title: "Releases",
        onClick: (e) => {
          e.preventDefault();
          window.open(`https://${hostname}/${owner}/${repo}/releases`);
        },
      }}
      className={classes.infoCard}
    >
      <table className="releases-table">
        <thead>
          <tr>
            <th className="table-column" style={{ fontSize: "1.5em" }}>
              Release version
            </th>
            <th className="table-column" style={{ fontSize: "1.5em" }}>
              AutoGov Status
            </th>
            <th className="table-column" style={{ fontSize: "1.5em" }}>
              Failed Policies
            </th>
          </tr>
        </thead>
        <tbody>
          {enhancedReleases.map((release: Release) => (
            <tr key={release.id}>
              <td className="table-column">
                <Link
                  href={release.html_url}
                  color="inherit"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className={classes.releaseTitle}>{release.name}</p>
                  <LocalOfferOutlinedIcon
                    fontSize="inherit"
                    className={classes.releaseTagIcon}
                  />{" "}
                  {release.tag_name}
                </Link>
              </td>
              <td className="table-column">
                <Typography align="center">
                  {release.autoGovStatus || "n/a"}
                </Typography>
              </td>
              <td className="table-column">
                <Typography align="right">
                  {renderFailedPolicies(release)}
                </Typography>
              </td>
              {release.prerelease && (
                <td className="table-column">
                  <Chip color="primary" size="small" label="Pre-release" />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </InfoCard>
  ) : (
    <></>
  );
};

export default ReleasesCard;

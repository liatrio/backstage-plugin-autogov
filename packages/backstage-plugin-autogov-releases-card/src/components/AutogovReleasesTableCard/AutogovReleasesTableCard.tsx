/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
 *
 * @license Apache-2.0
 *
 */

import React from "react";
import {
  Table,
  ResponseErrorPanel,
  InfoCard,
} from "@backstage/core-components";
import { parseEntityRef } from "@backstage/catalog-model";
import { useApi } from "@backstage/core-plugin-api";
import useAsync from "react-use/esm/useAsync";
import { TableWithoutViolations } from "./TableWithoutViolations";
import { TableWithViolations } from "./TableWithViolations";

import { autogovReleasesApiRef } from "../../api";

type AutogovReleasesTableCardProps = {
  ownerRef?: string;
  title?: string;
};

export const AutogovReleasesTableCard = (
  props: AutogovReleasesTableCardProps,
) => {
  const { ownerRef, title } = props;
  const autogovReleasesApi = useApi(autogovReleasesApiRef);
  if (!ownerRef) {
    throw new Error("ownerRef must be provided");
  }

  const {
    error: returnedError,
    loading,
    value: releasesData,
  } = useAsync(async () => {
    return autogovReleasesApi.getReleases(parseEntityRef(ownerRef));
  }, [autogovReleasesApi, ownerRef]);

  if (loading) {
    return (
      <InfoCard title={title || "Releases and Autogov Status"}>
        <Table
          options={{
            paging: false,
            padding: "dense",
            search: false,
          }}
          data={[]}
          columns={[]}
          isLoading
        />
      </InfoCard>
    );
  } else if (returnedError) {
    // return null;
    return (
      <InfoCard title={title || "Releases and Autogov Status"}>
        <ResponseErrorPanel error={returnedError} />
      </InfoCard>
    );
  }

  if (!releasesData) {
    return (
      <InfoCard title={title || "Releases and Autogov Status"}>
        <ResponseErrorPanel error={Error("No autogov data found")} />
      </InfoCard>
    );
  }

  if (
    !releasesData.some(
      (release: any) => release.autogovFailedPolicies?.length > 0,
    )
  ) {
    return (
      <InfoCard title={title || "Releases and Autogov Status"}>
        <TableWithoutViolations releasesData={releasesData} />
      </InfoCard>
    );
  }
  return (
    <InfoCard title={title || "Releases and Autogov Status"}>
      <TableWithViolations releasesData={releasesData} />
    </InfoCard>
  );
};

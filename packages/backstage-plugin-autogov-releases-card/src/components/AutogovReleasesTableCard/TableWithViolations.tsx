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
  TableColumn,
  TableFilter,
  SubvalueCell,
} from "@backstage/core-components";
import ReleaseStatus from "./releaseStatus";
import { SubvalueWithIcon, FailedPolicies, LinkedRelease } from "./common";

type TableWithViolationsProps = {
  releasesData: any[];
};

export const TableWithViolations = (props: TableWithViolationsProps) => {
  const { releasesData } = props;
  const columns: TableColumn[] = [
    {
      title: "Release",
      field: "name",
      customFilterAndSearch: (query, row: any) =>
        `${row.name} ${row.subvalue}`
          .toLocaleUpperCase("en-US")
          .includes(query.toLocaleUpperCase("en-US")),
      render: (row: any): React.ReactNode => (
        <SubvalueCell
          value=<LinkedRelease url={row.url} name={row.name} />
          subvalue=<SubvalueWithIcon tag={row.tag} />
        />
      ),
    },
    {
      title: "Autogov Status",
      field: "autogovStatus",
      customFilterAndSearch: (query, row: any) =>
        row.autogovStatus
          .toLocaleUpperCase()
          .includes(query.toLocaleUpperCase()),
      render: (row: any): React.ReactNode => (
        <ReleaseStatus autogovStatus={row.autogovStatus || "N/A"} />
      ),
    },
    {
      title: "Failed Policies",
      field: "failedPolicies",
      customFilterAndSearch: (query, row: any) =>
        row.autogovFailedPolicies
          .map((violation: any) => `${violation.policy} ${violation.message}`)
          .join(" ")
          .includes(query),
      render: (row: any): React.ReactNode => (
        <FailedPolicies failedPolicies={row.autogovFailedPolicies || []} />
      ),
    },
  ];

  const filters: TableFilter[] = [
    {
      column: "Autogov Status",
      type: "multiple-select",
    },
  ];

  return (
    <Table
      options={{
        paging: false,
        padding: "dense",
      }}
      data={releasesData}
      columns={columns}
      filters={filters}
    />
  );
};

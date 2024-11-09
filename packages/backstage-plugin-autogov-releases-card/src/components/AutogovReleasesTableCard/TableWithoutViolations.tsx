import React from "react";
import {
  Table,
  TableColumn,
  TableFilter,
  SubvalueCell,
} from "@backstage/core-components";
import ReleaseStatus from "./releaseStatus";
import { SubvalueWithIcon, LinkedRelease } from "./common";

type TableWithoutViolationsProps = {
  releasesData: any[];
};

export const TableWithoutViolations = (props: TableWithoutViolationsProps) => {
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

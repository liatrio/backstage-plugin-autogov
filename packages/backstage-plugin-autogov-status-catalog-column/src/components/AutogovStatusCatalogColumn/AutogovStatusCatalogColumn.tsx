/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import React from "react";
import { TableColumn } from "@backstage/core-components";
import {
  CatalogTableColumnsFunc,
  CatalogTable,
  CatalogTableRow,
} from "@backstage/plugin-catalog";
import { EntityListContextProps } from "@backstage/plugin-catalog-react";
import ReleaseStatus from "./releaseStatus";

export const AUTOGOV_STATUS_ANNOTATION =
  "liatrio.com/autogov-latest-release-status";

export enum AUTOGOV_STATUSES {
  PASSED = "PASSED",
  FAILED = "FAILED",
  N_A = "N/A",
  ERROR = "ERROR",
}

export enum AUTOGOV_STATUS_WEIGHT {
  PASSED = 1,
  FAILED = 2,
  N_A = 3,
  UNKNOWN = 4,
}

export const getAutogovStatusWeight = (
  status: string,
): AUTOGOV_STATUS_WEIGHT => {
  switch (status) {
    case AUTOGOV_STATUSES.PASSED:
      return AUTOGOV_STATUS_WEIGHT.PASSED;
    case AUTOGOV_STATUSES.FAILED:
      return AUTOGOV_STATUS_WEIGHT.FAILED;
    case AUTOGOV_STATUSES.N_A:
      return AUTOGOV_STATUS_WEIGHT.N_A;
    default:
      return AUTOGOV_STATUS_WEIGHT.UNKNOWN;
  }
};

/**
 * Creates a custom catalog column for displaying Autogov release status.
 *
 * @returns {TableColumn<CatalogTableRow>} A table column configuration object with the following properties:
 *  - title: Column header displaying "Latest Release Autogov Status"
 *  - field: References the 'autogovReleaseStatus' field
 *  - customSort: Custom sorting function comparing Autogov status weights between entities
 *  - render: Renders a ReleaseStatus component with the entity data
 *
 * @example
 * const statusColumn = createAutogovStatusCatalogColumn();
 *
 */
export function createAutogovStatusCatalogColumn(): TableColumn<CatalogTableRow> {
  return {
    title: "Latest Release Autogov Status",
    field: "autogovReleaseStatus",
    customSort({ entity: entity1 }, { entity: entity2 }) {
      const status1 = getAutogovStatusWeight(
        (
          entity1.metadata?.annotations?.[AUTOGOV_STATUS_ANNOTATION] || ""
        ).toUpperCase(),
      );

      const status2 = getAutogovStatusWeight(
        (
          entity2.metadata?.annotations?.[AUTOGOV_STATUS_ANNOTATION] || ""
        ).toUpperCase(),
      );

      return status1 - status2;
    },
    render: ({ entity }) => {
      return <ReleaseStatus entity={entity} />;
    },
  };
}

/**
 * Function that inserts a new column into a catalog table.
 * @param leftColumnTitle - Title of the column to the left of the insertion point
 * @param context - Context props from the entity list component
 * @returns Array of table columns for the catalog table row
 *
 * @example
 * const columns = insertColumn('Status', entityListContext);
 */
type InsertColumnFunc = (
  leftColumnTitle: string,
  context: EntityListContextProps,
) => TableColumn<CatalogTableRow>[];

/**
 * A function that inserts the Autogov Status column to the right of a specified column in the default columns list.
 *
 * @param leftColumnTitle - The title of the column after which to insert the Autogov Status column
 * @param entityListContext - The context object containing information about the entity list, including filters
 * @returns An array of columns with the Autogov Status column inserted at the specified position
 *
 * @remarks
 * This function only inserts the Autogov Status column if the entity kind filter is set to 'component'
 * (case-insensitive comparison). The insertion is done by splicing the array at the index immediately
 * following the specified left column.
 *
 * @example
 * ```typescript
 * const columns = defaultColumnsWithAutogovStatusRightOf('Name', entityContext);
 * ```
 */
export const defaultColumnsWithAutogovStatusRightOf: InsertColumnFunc = (
  leftColumnTitle,
  entityListContext,
) => {
  const defaultColumns = CatalogTable.defaultColumnsFunc(entityListContext);
  if (
    entityListContext.filters.kind?.value.toLocaleLowerCase() === "component"
  ) {
    const leftColumnIndex = defaultColumns.findIndex(
      (column: any) => column.title === leftColumnTitle,
    );
    defaultColumns.splice(
      leftColumnIndex + 1,
      0,
      createAutogovStatusCatalogColumn(),
    );
  }
  return defaultColumns;
};

/**
 * Function that extends the default catalog table columns with an Autogov status column.
 * This function is used as a columns provider for the CatalogTable component.
 *
 * @param {EntityListContextProps} entityListContext - The context object containing information about the entity list
 * @returns {TableColumn<CatalogTableRow>[]} An array of table columns including the Autogov status column if the entity kind is 'component'
 *
 * @remarks
 * This function only inserts the Autogov Status column if the entity kind filter is set to 'component'
 * (case-insensitive comparison).
 *
 * @example
 * ```tsx
 * <CatalogTable columns={defaultColumnsWithAutogovStatus} />
 * ```
 */
export const defaultColumnsWithAutogovStatus: CatalogTableColumnsFunc = (
  entityListContext,
) => {
  const defaultColumns = CatalogTable.defaultColumnsFunc(entityListContext);
  if (
    entityListContext.filters.kind?.value.toLocaleLowerCase() === "component"
  ) {
    defaultColumns.push(createAutogovStatusCatalogColumn());
  }
  return defaultColumns;
};

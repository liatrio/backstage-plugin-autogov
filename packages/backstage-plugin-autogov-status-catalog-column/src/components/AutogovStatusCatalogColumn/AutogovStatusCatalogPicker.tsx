import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { EntityFilter } from "@backstage/plugin-catalog-react";
import { EntityAutocompletePicker } from "@backstage/plugin-catalog-react";
import { DefaultEntityFilters } from "@backstage/plugin-catalog-react";

export const AUTOGOV_STATUS_ANNOTATION =
  "liatrio.com/autogov-latest-release-status";

/** @public */
/**
 * @typedef {string} CatalogReactEntityAutogovStatusPickerClassKey
 * @description Type definition for the styling class key used in the Autogov Status Catalog Picker component
 * @property {'input'} input - The class key for input styling
 */
export type CatalogReactEntityAutogovStatusPickerClassKey = "input";

/** @public */
/**
 * Props for the EntityTagPicker component.
 * @interface EntityTagPickerProps
 * @property {boolean} [showCounts] - Optional flag to display count indicators alongside tags.
 */
export type EntityTagPickerProps = {
  showCounts?: boolean;
};

/**
 * Custom hook that generates styles using Material-UI's makeStyles hook
 * @returns {Object} Object containing style classes for the CatalogReactEntityTagPicker component
 * @constant
 * @default
 * - input: An empty object for input styles
 */
const useStyles = makeStyles(
  { input: {} },
  { name: "CatalogReactEntityTagPicker" },
);

/**
 * A filter implementation for Autogov release status in the catalog.
 * Implements the EntityFilter interface to filter entities based on their Autogov status annotation.
 *
 * @class AutogovLatestReleaseStatusFilter
 * @implements {EntityFilter}
 *
 * @property {string[]} values - Array of status values to filter by
 *
 * @example
 * ```typescript
 * const filter = new AutogovLatestReleaseStatusFilter(['active', 'pending']);
 * const filtered = entities.filter(entity => filter.filterEntity(entity));
 * ```
 *
 * @constructor
 * @param {string[]} values - The status values to filter entities by
 *
 * @method filterEntity - Checks if an entity matches the specified status values
 * @method toQueryValue - Returns the filter values as an array
 * @method getCatalogFilters - Returns the filter configuration for catalog queries
 */
/**
 * Filter class for filtering entities based on their Autogov status annotation.
 * @implements {EntityFilter}
 */
class AutogovLatestReleaseStatusFilter implements EntityFilter {
  constructor(readonly values: string[]) {}

  filterEntity(entity: any): boolean {
    const status = entity.metadata?.annotations?.[AUTOGOV_STATUS_ANNOTATION];
    return this.values.includes(status);
  }

  toQueryValue(): string[] {
    return this.values;
  }

  getCatalogFilters(): Record<string, string | string[]> {
    return {
      [`metadata.annotations.${AUTOGOV_STATUS_ANNOTATION}`]: this.values,
    };
  }
}

/**
 * Extension of DefaultEntityFilters that includes autogov status filtering capabilities.
 *
 * @interface EntityFilters
 * @extends {DefaultEntityFilters}
 *
 * @property {AutogovLatestReleaseStatusFilter} [autogovStatuses] - Optional filter for Autogov release statuses
 */
interface EntityFilters extends DefaultEntityFilters {
  autogovStatuses?: AutogovLatestReleaseStatusFilter;
}

/** @public */
/**
 * Component that renders a picker for Autogov release statuses in the entity catalog.
 * Provides autocompletion functionality for filtering entities based on their Autogov status.
 *
 * @param {EntityTagPickerProps} props - The properties passed to the component
 * @param {boolean} props.showCounts - Whether to show the count of entities for each status
 *
 * @returns {JSX.Element} An EntityAutocompletePicker component configured for Autogov statuses
 *
 * @example
 * <AutogovLatestReleaseStatusPicker showCounts={true} />
 */
export const AutogovLatestReleaseStatusPicker = (
  props: EntityTagPickerProps,
) => {
  const classes = useStyles();

  return (
    <EntityAutocompletePicker<EntityFilters>
      label="Autogov Status"
      name="autogovStatuses"
      path={`metadata.annotations.${AUTOGOV_STATUS_ANNOTATION}`}
      Filter={AutogovLatestReleaseStatusFilter}
      showCounts={props.showCounts}
      InputProps={{ className: classes.input }}
    />
  );
};

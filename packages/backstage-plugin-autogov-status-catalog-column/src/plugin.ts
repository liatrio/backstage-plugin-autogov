/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
 *
 * @license Apache-2.0
 *
 */

import { createPlugin } from "@backstage/core-plugin-api";

export const autogovStatusCatalogColumnPlugin = createPlugin({
  id: "autogov-status-catalog-column",
});

export {
  createAutogovStatusCatalogColumn,
  defaultColumnsWithAutogovStatus,
  defaultColumnsWithAutogovStatusRightOf,
} from "./components/AutogovStatusCatalogColumn/AutogovStatusCatalogColumn";

export { AutogovLatestReleaseStatusPicker } from "./components/AutogovStatusCatalogColumn/AutogovStatusCatalogPicker";

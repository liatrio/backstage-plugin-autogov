/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
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

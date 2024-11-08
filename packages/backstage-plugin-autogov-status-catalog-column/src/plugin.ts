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

/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import { createApiRef } from "@backstage/core-plugin-api";
import { ReleaseData } from "./types";
import { CompoundEntityRef } from "@backstage/catalog-model";

export const autogovReleasesApiRef = createApiRef<AutogovReleasesApi>({
  id: "plugin.autogov-releases.service",
});

export interface AutogovReleasesApi {
  getReleases(entityRef: CompoundEntityRef): Promise<ReleaseData[]>;
}

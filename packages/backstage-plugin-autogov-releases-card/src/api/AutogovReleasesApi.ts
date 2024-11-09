import { createApiRef } from "@backstage/core-plugin-api";
import { ReleaseData } from "./types";
import { CompoundEntityRef } from "@backstage/catalog-model";

export const autogovReleasesApiRef = createApiRef<AutogovReleasesApi>({
  id: "plugin.autogov-releases.service",
});

export interface AutogovReleasesApi {
  getReleases(entityRef: CompoundEntityRef): Promise<ReleaseData[]>;
}

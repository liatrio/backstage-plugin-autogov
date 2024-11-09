/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
 *
 * @license Apache-2.0
 *
 */

import { DiscoveryApi, FetchApi } from "@backstage/core-plugin-api";
import { ResponseError } from "@backstage/errors";
import { ReleaseData } from "./types";

import { AutogovReleasesApi } from "./AutogovReleasesApi";
import { CompoundEntityRef } from "@backstage/catalog-model";

export class AutogovReleasesClient implements AutogovReleasesApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  async getReleases(entityRef: CompoundEntityRef): Promise<ReleaseData[]> {
    const baseUrl = await this.discoveryApi.getBaseUrl("autogov-releases");
    const { kind, namespace, name } = entityRef;
    const response = await this.fetchApi.fetch(
      `${baseUrl}/releases/${kind}/${namespace}/${name}/`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw await ResponseError.fromResponse(response);
    }

    return response.json();
  }
}

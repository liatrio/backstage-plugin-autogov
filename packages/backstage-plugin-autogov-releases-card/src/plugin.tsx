/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
 *
 * @license Apache-2.0
 *
 */

import { stringifyEntityRef } from "@backstage/catalog-model";
import {
  createPlugin,
  createComponentExtension,
  createApiFactory,
  discoveryApiRef,
  fetchApiRef,
} from "@backstage/core-plugin-api";
import { useAsyncEntity } from "@backstage/plugin-catalog-react";
import React from "react";

import { autogovReleasesApiRef, AutogovReleasesClient } from "./api";

export const autogovReleasesCardPlugin = createPlugin({
  id: "autogov-releases-card",
  apis: [
    createApiFactory({
      api: autogovReleasesApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new AutogovReleasesClient({ discoveryApi, fetchApi }),
    }),
  ],
});

export const AutogovReleasesCard = autogovReleasesCardPlugin.provide(
  createComponentExtension({
    name: "AutogovReleasesCard",
    component: {
      lazy: () =>
        import("./components/AutogovReleasesTableCard").then(
          ({ AutogovReleasesTableCard }) => {
            return () => {
              const { entity } = useAsyncEntity();
              return (
                <AutogovReleasesTableCard
                  ownerRef={entity ? stringifyEntityRef(entity) : ""}
                />
              );
            };
          },
        ),
    },
  }),
);

/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import {
  coreServices,
  createBackendPlugin,
} from "@backstage/backend-plugin-api";
import { createRouter } from "./service/router";

/**
 * autogovReleasesPlugin backend plugin
 *
 * @public
 */
export const autogovReleasesPlugin = createBackendPlugin({
  pluginId: "autogov-releases",
  register(env) {
    env.registerInit({
      deps: {
        config: coreServices.rootConfig,
        logger: coreServices.logger,
        auth: coreServices.auth,
        discovery: coreServices.discovery,
        httpRouter: coreServices.httpRouter,
      },
      async init({ config, logger, auth, discovery, httpRouter }) {
        httpRouter.use(
          await createRouter({
            config,
            logger,
            auth,
            discovery,
          })
        );
        httpRouter.addAuthPolicy({
          path: "/health",
          allow: "unauthenticated",
        });
        httpRouter.addAuthPolicy({
          path: "/releases",
          allow: "unauthenticated",
        });
      },
    });
  },
});

import {
  coreServices,
  createBackendPlugin,
} from "@backstage/backend-plugin-api";
import { createRouter } from "./service/router";

/**
 * githubReleasesAssetsPlugin backend plugin
 *
 * @public
 */
export const githubReleasesAssetsPlugin = createBackendPlugin({
  pluginId: "github-releases-assets-backend",
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
      },
      async init({ httpRouter, logger, config }) {
        httpRouter.use(
          await createRouter({
            logger,
            config,
          }),
        );
        httpRouter.addAuthPolicy({
          path: "/health",
          allow: "unauthenticated",
        });
        httpRouter.addAuthPolicy({
          path: "/releases-assets",
          allow: "unauthenticated",
        });
      },
    });
  },
});

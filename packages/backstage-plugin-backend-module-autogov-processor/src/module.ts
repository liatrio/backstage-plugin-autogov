/**
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import {
  coreServices,
  createBackendModule,
} from "@backstage/backend-plugin-api";
import { catalogProcessingExtensionPoint } from "@backstage/plugin-catalog-node/alpha";
import { AutogovProcessor } from "./processor";

export const catalogModuleAutogovProcessor = createBackendModule({
  pluginId: "catalog",
  moduleId: "autogov-processor",
  register(reg) {
    reg.registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        config: coreServices.rootConfig,
        logger: coreServices.logger,
      },
      async init({ catalog, config, logger }) {
        logger.info("Initializing Autogov Processor");
        catalog.addProcessor(
          AutogovProcessor.fromConfig(config, {
            logger,
          })
        );
      },
    });
  },
});

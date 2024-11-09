/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
 *
 * @license Apache-2.0
 *
 */

import { createRouteRef } from "@backstage/core-plugin-api";

export const rootRouteRef = createRouteRef({
  id: "autogov-releases-card",
});

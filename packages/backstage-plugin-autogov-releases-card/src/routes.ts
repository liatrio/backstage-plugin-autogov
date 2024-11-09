/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import { createRouteRef } from "@backstage/core-plugin-api";

export const rootRouteRef = createRouteRef({
  id: "autogov-releases-card",
});

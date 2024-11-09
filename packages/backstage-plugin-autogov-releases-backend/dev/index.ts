/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import { createBackend } from "@backstage/backend-defaults";

const backend = createBackend();

backend.add(import("@backstage/plugin-auth-backend"));
backend.add(import("@backstage/plugin-auth-backend-module-guest-provider"));
backend.add(import("../src"));

backend.start();

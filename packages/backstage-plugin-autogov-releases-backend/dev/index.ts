/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
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

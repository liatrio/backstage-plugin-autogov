/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
 *
 * @license Apache-2.0
 *
 */

import { createDevApp } from "@backstage/dev-utils";
import { autogovStatusCatalogColumnPlugin } from "../src/plugin";

createDevApp().registerPlugin(autogovStatusCatalogColumnPlugin).render();

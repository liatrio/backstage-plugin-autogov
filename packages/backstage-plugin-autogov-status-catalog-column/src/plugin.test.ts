/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
 *
 * @license Apache-2.0
 *
 */

import { autogovStatusCatalogColumnPlugin } from "./plugin";

describe("autogov-status-catalog-column", () => {
  it("should export plugin", () => {
    expect(autogovStatusCatalogColumnPlugin).toBeDefined();
  });
});

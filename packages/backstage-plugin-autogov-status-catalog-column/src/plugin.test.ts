/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
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

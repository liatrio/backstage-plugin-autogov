/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import { autogovReleasesCardPlugin } from "./plugin";

describe("autogov-releases-card", () => {
  it("should export plugin", () => {
    expect(autogovReleasesCardPlugin).toBeDefined();
  });
});

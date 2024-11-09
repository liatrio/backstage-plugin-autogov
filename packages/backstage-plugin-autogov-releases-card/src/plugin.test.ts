/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen
 * @author Amber Beasley
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

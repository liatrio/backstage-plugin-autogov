import { githubReleasesAutogovPlugin } from "./plugin";

describe("github-releases-autogov", () => {
  it("should export plugin", () => {
    expect(githubReleasesAutogovPlugin).toBeDefined();
  });
});

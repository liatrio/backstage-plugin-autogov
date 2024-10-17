import {
  createPlugin,
  createRoutableExtension,
} from "@backstage/core-plugin-api";

import { rootRouteRef } from "./routes";

export const githubReleasesAutogovPlugin = createPlugin({
  id: "github-releases-autogov",
  routes: {
    root: rootRouteRef,
  },
});

export const GithubReleasesAutogovPage = githubReleasesAutogovPlugin.provide(
  createRoutableExtension({
    name: "GithubReleasesAutogovPage",
    component: () =>
      import("./components/GitHubReleaseCard/CustomInsightsPage").then(
        (m) => m.CustomInsightsPage,
      ),
    mountPoint: rootRouteRef,
  }),
);

import React from "react";
import { createDevApp } from "@backstage/dev-utils";
import {
  githubReleasesAutogovPlugin,
  GithubReleasesAutogovPage,
} from "../src/plugin";

createDevApp()
  .registerPlugin(githubReleasesAutogovPlugin)
  .addPage({
    element: <GithubReleasesAutogovPage />,
    title: "Root Page",
    path: "/github-releases-autogov",
  })
  .render();

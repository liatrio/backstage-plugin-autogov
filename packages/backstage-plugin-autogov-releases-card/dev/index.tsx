import { createDevApp } from "@backstage/dev-utils";
import { autogovReleasesCardPlugin } from "../src/plugin";

createDevApp().registerPlugin(autogovReleasesCardPlugin).render();

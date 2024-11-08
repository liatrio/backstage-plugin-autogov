import { createDevApp } from "@backstage/dev-utils";
import { autogovStatusCatalogColumnPlugin } from "../src/plugin";

createDevApp().registerPlugin(autogovStatusCatalogColumnPlugin).render();

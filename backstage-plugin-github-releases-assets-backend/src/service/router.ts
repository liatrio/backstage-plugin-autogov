import { MiddlewareFactory } from "@backstage/backend-defaults/rootHttpRouter";
import { LoggerService } from "@backstage/backend-plugin-api";
import { Config } from "@backstage/config";
import express from "express";

import expressRouter from "express-promise-router";
import fetch from "node-fetch";

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = expressRouter();
  router.use(express.json());

  router.get("/health", (_, response) => {
    logger.info("PONG!");
    response.json({ status: "ok" });
  });

  router.get("/releases-assets", async (req, response) => {
    const { assetUrl } = req.query;

    if (!assetUrl) {
      response
        .status(400)
        .json({ error: "Missing required query parameters: assetUrl" });
      return;
    }

    // GithubAccessToken for live environments, GITHUB_TOKEN for local development
    const token = process.env.GithubAccessToken || process.env.GITHUB_TOKEN;

    const stringUrl = String(assetUrl);

    try {
      const contentResponse = await fetch(stringUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/octet-stream", // GitHub API requires this header for downloading assets
        },
      });

      if (!contentResponse.ok) {
        const errorBody = await contentResponse.text();
        throw new Error(
          `Failed to fetch content from assetUrl. Status: ${contentResponse.status}, Body: ${errorBody}`,
        );
      }

      const content = await contentResponse.text();

      logger.info("Fetched content successfully!");
      response.send(content); // Send the content as the response
    } catch (error) {
      const err = error as Error;
      logger.error("Error fetching content:", err);
      response
        .status(500)
        .json({ error: "Failed to fetch content", details: err.message });
    }
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}

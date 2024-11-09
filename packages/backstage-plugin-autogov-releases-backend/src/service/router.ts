/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import { MiddlewareFactory } from "@backstage/backend-defaults/rootHttpRouter";
import {
  AuthService,
  LoggerService,
  RootConfigService,
  DiscoveryService,
} from "@backstage/backend-plugin-api";
import { GithubIntegration, ScmIntegrations } from "@backstage/integration";
import { CatalogApi, CatalogClient } from "@backstage/catalog-client";
import {
  Entity,
  getEntitySourceLocation,
  stringifyEntityRef,
} from "@backstage/catalog-model";
import express from "express";
import expressRouter from "express-promise-router";

export const AUTOGOV_STATUS_FILE_ANNOTATION = "liatrio.com/autogov-result-file";

export interface RouterOptions {
  config: RootConfigService;
  logger: LoggerService;
  auth: AuthService;
  catalog?: CatalogApi;
  discovery: DiscoveryService;
}

type ShouldProcessEntity = (
  entity: Entity,
  options: any,
  logger?: LoggerService,
) => boolean;

const shouldProcessEntity: ShouldProcessEntity = (
  entity: Entity,
  options: any,
  logger?: LoggerService,
) => {
  const entityKinds = options.entityKinds;
  const entityTypes = options.entityTypes;
  const entityKind = entity.kind.toLowerCase();
  const entitySpecType =
    typeof entity.spec?.type === "string"
      ? entity.spec?.type?.toLowerCase()
      : undefined;
  logger?.debug(
    `Checking if entity ${stringifyEntityRef(
      entity,
    )} should be processed, kind: ${entityKind}, from: ${JSON.stringify(
      entityKinds,
    )}, type: ${entitySpecType}, from ${JSON.stringify(entityTypes)}`,
  );
  logger?.debug(
    `Entity Types Length ${
      entityTypes.length
    }, kind match ${entityKinds.includes(
      entityKind,
    )}, type match: ${entityTypes.includes(entitySpecType || "undefined")}`,
  );
  if (entityTypes.length > 0) {
    if (entitySpecType) {
      return (
        entityKinds.includes(entityKind) && entityTypes.includes(entitySpecType)
      );
    }
    return false;
  }
  return entityTypes.includes(entityKind);
};

export async function createRouter(
  dependencies: RouterOptions,
): Promise<express.Router> {
  const { logger, auth, config } = dependencies;
  const catalog =
    dependencies.catalog ||
    new CatalogClient({ discoveryApi: dependencies.discovery });

  const c = config.getConfig("autogov");
  const githubConfig = c?.getConfig("github");
  const resultsFileConfig = githubConfig?.getConfig("resultsFile");

  const options = {
    cacheTTL: githubConfig?.getOptional("cacheTTL") || { minutes: 30 },
    requireAnnotation:
      githubConfig?.getOptionalBoolean("requireAnnotation") ?? true,
    entityKinds: githubConfig
      ?.getOptionalStringArray("entityKinds")
      ?.map((v) => v.toLowerCase()) || ["component"],
    entityTypes: githubConfig
      ?.getOptionalStringArray("entityTypes")
      ?.map((v) => v.toLowerCase()) || ["website"],
    resultsFile: {
      default: resultsFileConfig?.getOptional("default") ?? "results",
      allowOverride:
        resultsFileConfig?.getOptionalBoolean("allowOverride") ?? false,
    },
    maxReleases: githubConfig?.getOptionalNumber("maxReleases") || 5,
  };
  logger.debug(`Autogov options: ${JSON.stringify(options)}`);

  const router = expressRouter();
  router.use(express.json());

  router.get("/health", (_, response) => {
    logger.info("PONG!");
    response.json({ status: "ok" });
  });

  router.get("/releases/:kind/:namespace/:name/", async (request, response) => {
    const params = request.params;
    logger.info(`Get Releases called, got query: ${JSON.stringify(params)}`);
    const { kind, namespace, name } = params;
    const { token } = await auth.getPluginRequestToken({
      onBehalfOf: await auth.getOwnServiceCredentials(),
      targetPluginId: "catalog",
    });

    const entity = await catalog.getEntityByRef(
      { kind, namespace, name },
      { token },
    );

    if (!entity) {
      response.statusCode = 404;
      response.json({
        status: "error",
        error: "Entity not found",
      });
      return;
    }

    if (!shouldProcessEntity(entity, options, logger)) {
      response.statusCode = 500;
      response.json({
        status: "error",
        error:
          "Entity not supported because it's not in the configured entity kinds or types",
      });
      return;
    }

    const scmIntegrations = ScmIntegrations.fromConfig(config);
    if (!scmIntegrations) {
      response.statusCode = 500;
      response.json({
        status: "error",
        error: "No SCM integrations available",
      });
      return;
    }

    const entitySourceLocation = getEntitySourceLocation(entity);
    if (!entitySourceLocation) {
      response.statusCode = 500;
      response.json({
        status: "error",
        error: "No source location available",
      });
      return;
    }
    if (entitySourceLocation.type !== "url") {
      response.statusCode = 500;
      response.json({
        status: "error",
        error: "Unsupported source location type",
      });
      return;
    }

    if (
      options.requireAnnotation &&
      !entity.metadata.annotations?.[AUTOGOV_STATUS_FILE_ANNOTATION]
    ) {
      response.statusCode = 500;
      response.json({
        status: "error",
        error: "Autogov status file annotation not found and required",
      });
      return;
    }

    const scmIntegration = scmIntegrations.byUrl(entitySourceLocation.target);

    if (!scmIntegration) {
      response.statusCode = 500;
      response.json({
        status: "error",
        error: "No SCM integration found",
      });
      return;
    }

    if (scmIntegration.type !== "github") {
      response.statusCode = 500;
      response.json({
        status: "error",
        error: "Unsupported SCM integration type, only GitHub is supported",
      });
      return;
    }

    const githubIntegration = scmIntegration as GithubIntegration;
    const { token: githubToken, apiBaseUrl } = githubIntegration.config;

    let resultsFile = options.resultsFile.default;
    if (options.resultsFile.allowOverride) {
      if (entity.metadata.annotations?.[AUTOGOV_STATUS_FILE_ANNOTATION]) {
        resultsFile =
          entity.metadata.annotations[AUTOGOV_STATUS_FILE_ANNOTATION];
      }
      logger.debug(`Using results file: ${resultsFile}`);
    }

    if (!githubToken || !apiBaseUrl) {
      response.statusCode = 500;
      response.json({
        status: "error",
        error: "GitHub integration not configured properly",
      });
      return;
    }

    const projectSlug =
      entity?.metadata?.annotations?.["github.com/project-slug"];
    if (!projectSlug) {
      response.statusCode = 404;
      response.json({
        status: "error",
        error: "Project slug not found",
      });
      return;
    }

    const releasesResponse = await fetch(
      `${apiBaseUrl}/repos/${projectSlug}/releases`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${githubToken}`,
        },
      },
    );
    if (!releasesResponse.ok) {
      response.statusCode = releasesResponse.status;
      response.json({
        status: "error",
        error: "GitHub API request failed",
      });
      return;
    }

    let latestReleases: any[] = [];
    try {
      const releases = await releasesResponse.json();
      latestReleases = releases
        .slice(0, options.maxReleases)
        .map(async (release: any) => {
          let autogovStatus = undefined;
          let autogovFailedPolicies = undefined;
          const autogovAsset = release?.assets?.find((asset: any) => {
            return asset.name === resultsFile;
          });
          if (autogovAsset) {
            const resultsFileContentResponse = await fetch(autogovAsset.url, {
              headers: {
                Accept: "application/octet-stream",
                Authorization: `Bearer ${githubToken}`,
              },
            });
            if (resultsFileContentResponse.ok) {
              const resultsFileContent =
                await resultsFileContentResponse.text();
              try {
                const parsedResultsFileContent = JSON.parse(resultsFileContent);
                logger.debug(
                  `Parsed autogov status file: ${JSON.stringify(
                    parsedResultsFileContent,
                  )}`,
                );
                autogovStatus = parsedResultsFileContent.result;
                autogovFailedPolicies = parsedResultsFileContent.violations;
              } catch (error) {
                logger.error(`Failed to parse autogov status file: ${error}`);
              }
            }
          } else {
            logger.info(
              `Autogov status file not found in release assets: ${release.name}`,
            );
          }

          return {
            id: release.id,
            name: release.name,
            tag: release.tag_name,
            url: release.html_url,
            publishedAt: release.published_at,
            autogovAssetUrl: autogovAsset?.url,
            autogovStatus,
            autogovFailedPolicies,
          };
        });

      latestReleases = await Promise.all(latestReleases);
    } catch (error) {
      response.statusCode = 500;
      response.json({
        status: "error",
        error: "Failed to parse GitHub API response",
      });
      return;
    }

    response.json(latestReleases);
    return;
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}

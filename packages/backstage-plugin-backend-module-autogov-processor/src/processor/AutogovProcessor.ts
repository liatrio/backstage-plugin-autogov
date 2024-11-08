/**
 * @file AutoGovProcessor.ts
 * @description Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 * @copyright 2024 Liatrio, Inc.
 */

import { LoggerService } from "@backstage/backend-plugin-api";
import { Config } from "@backstage/config";
import {
  Entity,
  getEntitySourceLocation,
  stringifyEntityRef,
} from "@backstage/catalog-model";
import {
  CatalogProcessor,
  CatalogProcessorCache,
} from "@backstage/plugin-catalog-node";
import {
  GithubIntegration,
  ScmIntegrationRegistry,
  ScmIntegrations,
} from "@backstage/integration";
import { durationToMilliseconds, HumanDuration } from "@backstage/types";
import fetch from "node-fetch";

import {
  AUTOGOV_STATUS_FILE_ANNOTATION,
  AUTOGOV_STATUS_ANNOTATION,
  AUTOGOV_STATUSES,
} from "@liatrio/backstage-plugin-autogov-common";

export type ShouldProcessEntity = (entity: Entity) => boolean;

interface CachedData {
  [key: string]: number | string;
  autogovStatus: string;
  cachedTime: number;
}

interface AutogovProcessorOptionsResultsFile {
  allowOverride?: boolean;
  default?: string;
}

export interface AutogovProcessorOptions {
  logger: LoggerService;

  cacheTTL?: HumanDuration;
  resultsFile?: AutogovProcessorOptionsResultsFile;
  requireAnnotation?: boolean;
  entityKinds?: string[];
  entityTypes?: string[];

  scmIntegrations?: ScmIntegrationRegistry;
}

/**
 * Represents a release which can either be an object containing release details or undefined.
 *
 * @typedef {Object} Release
 * @property {string} url - The URL of the release.
 * @property {number} id - The unique identifier of the release.
 * @property {Array<Object>} assets - An array of assets associated with the release.
 * @property {string} assets[].url - The URL of the asset.
 * @property {string} assets[].browser_download_url - The browser download URL of the asset.
 * @property {number} assets[].id - The unique identifier of the asset.
 */
type Release =
  | {
      url: string;
      id: number;
      assets: Array<{
        url: string;
        browser_download_url: string;
        id: number;
      }>;
    }
  | undefined;

/**
 * Processor that checks git repositories for autogov status files in their latest release.
 *
 * This processor will:
 * - Look for entities matching configured kinds and types
 * - Check if they have GitHub source locations
 * - Fetch the latest release from their GitHub repository
 * - Look for a results file in the release assets
 * - Parse the results file to determine autogov status
 * - Cache results for configured TTL
 * - Add autogov status as an annotation on the entity
 *
 * @implements {CatalogProcessor}
 * @class
 */

/**
 * Manages caching and fetching of autogov statuses from GitHub repositories.
 * Processes entities through the catalog to add autogov status annotations.
 *
 * @property {LoggerService} logger - Logger service for the processor
 * @property {ScmIntegrationRegistry} scmIntegrations - Registry of SCM integrations
 * @property {AutogovProcessorOptionsResultsFile} resultsFile - Configuration for results file handling
 * @property {boolean} requireAnnotation - Whether to require autogov annotation
 * @property {string[]} entityKinds - Array of entity kinds to process
 * @property {string[]} entityTypes - Array of entity types to process
 * @property {Object} loggerMeta - Metadata for logging
 * @property {number} cacheTTLMilliseconds - Cache TTL in milliseconds
 */
export class AutogovProcessor implements CatalogProcessor {
  private readonly logger: LoggerService;
  private readonly scmIntegrations: ScmIntegrationRegistry | undefined;
  private readonly resultsFile: AutogovProcessorOptionsResultsFile;
  private readonly requireAnnotation: boolean;
  private readonly entityKinds: string[];
  private readonly entityTypes: string[];
  private readonly loggerMeta = { plugins: "AutogovProcessor" };
  private cacheTTLMilliseconds: number;

  /**
   * Determines if a given entity should be processed based on its kind and type.
   *
   * @param entity - The entity to evaluate for processing
   * @returns boolean indicating whether the entity should be processed
   *
   * The method uses the following logic:
   * 1. If entityTypes array has entries:
   *    - Both entity kind and spec.type must match configured kinds/types
   *    - Returns false if spec.type is undefined
   * 2. If entityTypes array is empty:
   *    - Only checks if entity kind matches configured kinds
   */
  private shouldProcessEntity: ShouldProcessEntity = (entity: Entity) => {
    const entityKind = entity.kind.toLowerCase();
    const entitySpecType =
      typeof entity.spec?.type === "string"
        ? entity.spec?.type?.toLowerCase()
        : undefined;
    this.logger.debug(
      `Checking if entity ${stringifyEntityRef(
        entity,
      )} should be processed, kind: ${entityKind}, from: ${JSON.stringify(
        this.entityKinds,
      )}, type: ${entitySpecType}, from ${JSON.stringify(this.entityTypes)}`,
      {
        ...this.loggerMeta,
      },
    );
    this.logger.debug(
      `Entity Types Length ${
        this.entityTypes.length
      }, kind match ${this.entityKinds.includes(
        entityKind,
      )}, type match: ${this.entityTypes.includes(
        entitySpecType || "undefined",
      )}`,
      { ...this.loggerMeta },
    );
    if (this.entityTypes.length > 0) {
      if (entitySpecType) {
        return (
          this.entityKinds.includes(entityKind) &&
          this.entityTypes.includes(entitySpecType)
        );
      }
      return false;
    }
    return this.entityTypes.includes(entityKind);
  };

  /**
   * Returns the name of the processor.
   * @returns {string} The name of the processor as 'github-autogov-processor'
   */
  getProcessorName(): string {
    return "github-autogov-processor";
  }

  /**
   * Creates a new instance of AutogovProcessor.
   * @param options - Configuration options for the GitHub Autogov Processor
   * @param options.logger - Logger instance for recording processor activities
   * @param options.scmIntegrations - Source Control Management integrations configuration
   * @param options.resultsFile - Configuration for results file location and override settings
   * @param options.resultsFile.allowOverride - Whether to allow override of default results file location
   * @param options.resultsFile.default - Default name for the results file
   * @param options.requireAnnotation - Whether to require annotations for processing (defaults to true)
   * @param options.entityKinds - Array of entity kinds to process (defaults to ['component'])
   * @param options.entityTypes - Array of entity types to process (defaults to ['website'])
   * @param options.cacheTTL - Cache time-to-live duration (defaults to 30 minutes)
   */
  constructor(options: AutogovProcessorOptions) {
    this.logger = options.logger;
    this.logger.info(`Autogov Processor initialized`, {
      ...this.loggerMeta,
    });
    this.scmIntegrations = options.scmIntegrations;
    this.logger.debug(
      `Autogov Processor SCM Integrations: ${JSON.stringify(
        options.scmIntegrations,
      )}`,
      { ...this.loggerMeta },
    );

    this.resultsFile = {
      allowOverride: options.resultsFile?.allowOverride ?? false,
      default: options.resultsFile?.default ?? "results",
    };
    this.logger.debug(
      `Autogov Processor results file set to ${JSON.stringify(
        this.resultsFile,
      )}`,
      { ...this.loggerMeta },
    );

    this.requireAnnotation = options.requireAnnotation ?? true;
    this.logger.debug(
      `Autogov Processor require annotation set to ${this.requireAnnotation}`,
      { ...this.loggerMeta },
    );

    this.entityKinds = options.entityKinds ?? ["component"];
    this.logger.debug(
      `Autogov Processor entity kinds set to ${this.entityKinds}`,
      { ...this.loggerMeta },
    );

    this.entityTypes = options.entityTypes ?? ["website"];
    this.logger.debug(
      `Autogov Processor entity types set to ${this.entityTypes}`,
      { ...this.loggerMeta },
    );

    this.cacheTTLMilliseconds = durationToMilliseconds(
      options.cacheTTL || { minutes: 30 },
    );
    this.logger.debug(
      `Autogov Processor Cache TTL set to ${this.cacheTTLMilliseconds}ms`,
      {
        ...this.loggerMeta,
      },
    );
  }

  /**
   * Creates a new instance of AutogovProcessor from a Config object.
   *
   * @param config - The application configuration object
   * @param [options] - Configuration options for the Autogov processor
   * @returns A new instance of AutogovProcessor configured with the provided options
   *
   * @remarks
   * This method initializes a AutogovProcessor by:
   * - Reading optional autogov configuration section
   * - Setting up cache TTL, results file path, and annotation requirements
   * - Configuring entity kinds and types filters
   * - Integrating SCM configuration
   *
   * @example
   * ```ts
   * const processor = AutogovProcessor.fromConfig(config, {
   *   cacheTTL: 3600,
   *   requireAnnotation: true
   * });
   * ```
   */
  static fromConfig(
    config: Config,
    options: AutogovProcessorOptions,
  ): AutogovProcessor {
    const c = config.getOptionalConfig("autogov");
    const githubConfig = c?.getOptionalConfig("github");
    const resultsFileConfig = githubConfig?.getOptionalConfig("resultsFile");
    if (githubConfig) {
      options.cacheTTL = githubConfig.getOptional("cacheTTL");
      options.resultsFile = {
        allowOverride: githubConfig.getOptional("resultsFile"),
        default: resultsFileConfig?.getOptional("default"),
      };
      options.requireAnnotation =
        githubConfig.getOptionalBoolean("requireAnnotation");
      options.entityKinds = githubConfig
        .getOptionalStringArray("entityKinds")
        ?.map((v) => v.toLowerCase());
      options.entityTypes = githubConfig
        .getOptionalStringArray("entityTypes")
        ?.map((v) => v.toLowerCase());
    }
    const scmIntegrations = ScmIntegrations.fromConfig(config);
    if (scmIntegrations) {
      options.scmIntegrations = scmIntegrations;
    }
    return new AutogovProcessor(options);
  }

  /**
   * Retrieves autogov data from GitHub API for a given entity using the specified GitHub integration.
   * The method fetches the latest release from the repository and looks for a results file within its assets.
   *
   * @param entity - The entity containing metadata and annotations for processing
   * @param integration - GitHub integration configuration containing token and API base URL
   * @returns Promise<string> - Returns the parsed result from the autogov data file, or an error/N/A status
   *
   * @throws Will not throw errors directly, but returns error status strings in case of failures
   *
   * @remarks
   * The method performs the following steps:
   * 1. Validates input entity and required configurations
   * 2. Determines the results file name (using default or override from annotations)
   * 3. Fetches the latest release from the repository
   * 4. Locates and downloads the results file from release assets
   * 5. Parses and returns the result content
   *
   * @example
   * const result = await getAutogovDataFromGithubAPI(entity, githubIntegration);
   * // Returns: "SUCCESS", "ERROR", "N_A", or other status strings
   */
  private async getAutogovDataFromGithubAPI(
    entity: Entity,
    integration: GithubIntegration,
  ): Promise<string> {
    if (!entity || !entity.metadata?.annotations) {
      this.logger.error(`Entity input incorrect`, {
        ...this.loggerMeta,
      });
      return AUTOGOV_STATUSES.ERROR;
    }

    // Get results file source
    let resultsFile = this.resultsFile.default;
    if (this.resultsFile.allowOverride) {
      if (entity.metadata.annotations[AUTOGOV_STATUS_FILE_ANNOTATION]) {
        resultsFile =
          entity.metadata.annotations[AUTOGOV_STATUS_FILE_ANNOTATION];
        this.logger.debug(
          `Overriding results file with annotation value: ${resultsFile}`,
          {
            ...this.loggerMeta,
          },
        );
      }
    }
    this.logger.debug(`Using results file: ${resultsFile}`, {
      ...this.loggerMeta,
    });

    // Check for required config values
    const { token, apiBaseUrl } = integration.config;
    if (!token || !apiBaseUrl) {
      this.logger.error(`Github Integration missing token or apiBaseUrl`, {
        ...this.loggerMeta,
      });
      return AUTOGOV_STATUSES.ERROR;
    }

    // Get project slug from entity annotations
    const projectSlug =
      entity?.metadata?.annotations["github.com/project-slug"];
    if (!projectSlug) {
      this.logger.error(`No project slug found in entity annotations`, {
        ...this.loggerMeta,
      });
      return AUTOGOV_STATUSES.ERROR;
    }

    // Get latest release
    const latestReleaseResponse = await fetch(
      `${apiBaseUrl}/repos/${projectSlug}/releases/latest`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!latestReleaseResponse) {
      this.logger.error(`Error fetching latest release`, {
        ...this.loggerMeta,
      });
      return AUTOGOV_STATUSES.ERROR;
    }

    let latestRelease: Release = undefined;
    try {
      latestRelease = await latestReleaseResponse.json();
    } catch (error) {
      this.logger.error(`Error parsing latest release`, {
        ...this.loggerMeta,
      });
      return AUTOGOV_STATUSES.ERROR;
    }

    if (latestRelease && latestRelease?.assets.length <= 0) {
      this.logger.debug(`No assets found in latest release`, {
        ...this.loggerMeta,
      });
      return AUTOGOV_STATUSES.N_A;
    }

    const result = latestRelease?.assets.find((asset: any) => {
      return asset.name === resultsFile;
    });
    if (!result) {
      this.logger.debug(`No results asset found`, { ...this.loggerMeta });
      return AUTOGOV_STATUSES.N_A;
    }

    const resultsFileContentResponse = await fetch(result.url, {
      headers: {
        Accept: "application/octet-stream",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!resultsFileContentResponse) {
      this.logger.error(`Error fetching results file content`, {
        ...this.loggerMeta,
      });
      return AUTOGOV_STATUSES.ERROR;
    }

    const content = await resultsFileContentResponse.text();
    try {
      const parsedResultsFileContent = JSON.parse(content);
      return parsedResultsFileContent.result;
    } catch (error) {
      this.logger.error(`Error parsing results file content`, {
        ...this.loggerMeta,
      });
      return AUTOGOV_STATUSES.ERROR;
    }
  }

  /**
   * Retrieves cached GitHub releases data for a given entity, or fetches new data if cache is expired/empty.
   *
   * @param entity - The entity to fetch releases data for
   * @param integration - GitHub integration instance used to make API calls
   * @param cache - Cache instance to store/retrieve release data
   * @returns Promise containing the autogov status string
   *
   * @remarks
   * The method follows this flow:
   * 1. Attempts to retrieve cached data for the entity
   * 2. Check if the last result was an error, and if so, fetch fresh data
   * 3. If cache is missing/expired, fetches fresh data from GitHub API
   * 4. Updates cache with new data if needed
   * 5. Logs debug information about cache status
   *
   * @private
   */
  private async getCachedReleases(
    entity: Entity,
    integration: GithubIntegration,
    cache: CatalogProcessorCache,
  ): Promise<string> {
    let cachedData = (await cache.get(stringifyEntityRef(entity))) as
      | CachedData
      | undefined;
    if (cachedData && cachedData.autogovStatus === AUTOGOV_STATUSES.ERROR) {
      cachedData = undefined;
    }
    if (!cachedData || this.isExpired(cachedData)) {
      const autogovStatus = await this.getAutogovDataFromGithubAPI(
        entity,
        integration,
      );
      cachedData = {
        autogovStatus: autogovStatus,
        cachedTime: Date.now(),
      };
      await cache.set(stringifyEntityRef(entity), cachedData);
    }
    const cacheTimeRemaining =
      this.cacheTTLMilliseconds - (Date.now() - (cachedData.cachedTime || 0));
    this.logger.debug(
      `Fetched cached autogovStatus for ${stringifyEntityRef(
        entity,
      )} cached on ${
        cachedData.cachedTime
      }, expires in ${cacheTimeRemaining}ms`,
      {
        ...this.loggerMeta,
        entity,
      },
    );
    return cachedData.autogovStatus;
  }

  /**
   * Determines if the cached data has exceeded its time-to-live (TTL).
   *
   * @param cachedData - The cached data object to check for expiration
   * @returns True if the cached data has expired, false otherwise
   *
   * @private
   */
  private isExpired(cachedData: CachedData): boolean {
    const elapsed = Date.now() - (cachedData.cachedTime || 0);
    return elapsed > this.cacheTTLMilliseconds;
  }

  /**
   * Processes an entity before it is added to the catalog, checking for autogov status.
   *
   * This method performs several validation steps:
   * 1. Verifies the entity should be processed based on entity type
   * 2. Checks for SCM integration availability
   * 3. Validates entity has a URL source location
   * 4. Checks for required autogov annotation if enabled
   * 5. Verifies the URL is a Github URL
   * 6. Retrieves and processes autogov status data
   *
   * @param entity - The entity to process
   * @param _ - Unused parameter
   * @param __ - Unused parameter
   * @param ___ - Unused parameter
   * @param cache - Cache to store/retrieve autogov data
   *
   * @returns The processed entity with autogov status information added
   *
   * @throws Error if there is an issue retrieving or processing autogov data
   */
  async preProcessEntity(
    entity: Entity,
    _: any,
    __: any,
    ___: any,
    cache: CatalogProcessorCache,
  ): Promise<Entity> {
    const entityRef = stringifyEntityRef(entity);

    // Skip entities that are not in the entityType list
    if (!this.shouldProcessEntity(entity)) {
      this.logger.debug(
        `Skipping entity ${entityRef} because not in entityType list`,
        {
          ...this.loggerMeta,
        },
      );
      return entity;
    }

    // Skip entities that don't have a source location
    if (!this.scmIntegrations) {
      this.logger.warn(
        `No SCM Integrations available, skipping entity ${entityRef}`,
        { ...this.loggerMeta },
      );
      return entity;
    }

    // Skip entities that don't have a URL source location
    const entitySourceLocation = getEntitySourceLocation(entity);
    if (entitySourceLocation?.type !== "url") {
      this.logger.debug(`Skipping entity ${entityRef} because it's not a URL`, {
        ...this.loggerMeta,
      });
      return entity;
    }

    // If requireAnnotation is true, skip entities that don't have the autogov annotation
    if (
      this.requireAnnotation &&
      !entity.metadata?.annotations?.[AUTOGOV_STATUS_FILE_ANNOTATION]
    ) {
      this.logger.info(
        `Skipping entity ${entityRef} because it's missing the autogov annotation`,
        { ...this.loggerMeta, entityRef },
      );
      return entity;
    }

    this.logger.info(`Processing autogov entity ${entityRef}`, {
      ...this.loggerMeta,
    });

    // Skip entities that are not Github URLs
    const detectedIntegration = this.scmIntegrations.byUrl(
      entitySourceLocation.target,
    );
    if (detectedIntegration?.type !== "github") {
      this.logger.debug(
        `Skipping entity ${entityRef} because not a Github URL`,
        { ...this.loggerMeta },
      );
      return entity;
    }

    let autogovStatus =
      this.cacheTTLMilliseconds > 0
        ? await this.getCachedReleases(
            entity,
            detectedIntegration as GithubIntegration,
            cache,
          )
        : await this.getAutogovDataFromGithubAPI(
            entity,
            detectedIntegration as GithubIntegration,
          );

    // If requireAnnotation is false, set autogovStatus to N/A if it's an error
    if (!this.requireAnnotation && autogovStatus === AUTOGOV_STATUSES.ERROR) {
      this.logger.debug(
        `Setting autogovStatus to ${autogovStatus} for entity ${entityRef}`,
        {
          ...this.loggerMeta,
          entityRef,
        },
      );
      autogovStatus = AUTOGOV_STATUSES.N_A;
    }

    this.logger.info(
      `Found autogovStatus ${autogovStatus} releases for ${entityRef}`,
      {
        ...this.loggerMeta,
        entityRef,
      },
    );

    if (autogovStatus === AUTOGOV_STATUSES.ERROR) {
      this.logger.error(`Error processing entity ${entityRef}`, {
        ...this.loggerMeta,
        entityRef,
      });
      return entity;
    }

    this.addAutogovStatusToEntity(entity, autogovStatus);

    return entity;
  }

  /**
   * Adds or updates the autogov status annotation on an entity.
   *
   * @param entity - The entity to update with autogov status annotation
   * @param autogovStatus - The status string to set (PASSED, FAILED, N/A, ERROR)
   * @private
   *
   * @remarks
   * This method mutates the entity object by adding or updating the
   * 'liatrio.com/autogov-latest-release-status' annotation with
   * the provided status value.
   *
   * If the entity or entity.metadata is undefined, no changes are made.
   */
  private addAutogovStatusToEntity(
    entity: Entity,
    autogovStatus: string,
  ): void {
    if (entity.metadata) {
      const annotations = entity.metadata?.annotations || {};
      entity.metadata.annotations = annotations;
      annotations[AUTOGOV_STATUS_ANNOTATION] = autogovStatus;
    }
  }
}

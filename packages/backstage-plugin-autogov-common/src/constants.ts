export const AUTOGOV_STATUS_FILE_ANNOTATION = "liatrio.com/autogov-result-file";
export const AUTOGOV_STATUS_ANNOTATION =
  "liatrio.com/autogov-latest-release-status";

export enum AUTOGOV_STATUSES {
  PASSED = "PASSED",
  FAILED = "FAILED",
  N_A = "N/A",
  ERROR = "ERROR",
}

export enum AUTOGOV_STATUS_WEIGHT {
  PASSED = 1,
  FAILED = 2,
  N_A = 3,
  UNKNOWN = 4,
}

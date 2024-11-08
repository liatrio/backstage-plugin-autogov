import { AUTOGOV_STATUSES, AUTOGOV_STATUS_WEIGHT } from "./constants";

export const getAutogovStatusWeight = (
  status: string,
): AUTOGOV_STATUS_WEIGHT => {
  switch (status) {
    case AUTOGOV_STATUSES.PASSED:
      return AUTOGOV_STATUS_WEIGHT.PASSED;
    case AUTOGOV_STATUSES.FAILED:
      return AUTOGOV_STATUS_WEIGHT.FAILED;
    case AUTOGOV_STATUSES.N_A:
      return AUTOGOV_STATUS_WEIGHT.N_A;
    default:
      return AUTOGOV_STATUS_WEIGHT.UNKNOWN;
  }
};

// ReleaseStatus.tsx
import React from "react";
import { Chip } from "@material-ui/core";

/**
 * Represents the possible states of a release status.
 * @typedef {('passed'|'failed'|'other')} StatusType
 * @property {string} passed - Indicates the release has passed
 * @property {string} failed - Indicates the release has failed
 * @property {string} other - Indicates an undefined or alternative status
 */
type StatusType = "passed" | "failed" | "other";

/**
 * A record mapping status types to their corresponding color configurations.
 * @type {Record<StatusType, { backgroundColor: string; color: string }>}
 *
 * @property {Object} passed - Color scheme for passed status
 * @property {string} passed.backgroundColor - Background color for passed status (green)
 * @property {string} passed.color - Text color for passed status (white)
 *
 * @property {Object} failed - Color scheme for failed status
 * @property {string} failed.backgroundColor - Background color for failed status (#FF6666)
 * @property {string} failed.color - Text color for failed status (black)
 *
 * @property {Object} other - Color scheme for other status
 * @property {string} other.backgroundColor - Background color for other status (gray)
 * @property {string} other.color - Text color for other status (white)
 */
const chipColors: Record<
  StatusType,
  { backgroundColor: string; color: string }
> = {
  passed: {
    backgroundColor: "green",
    color: "white",
  },
  failed: {
    backgroundColor: "#FF6666",
    color: "black",
  },
  other: {
    backgroundColor: "gray",
    color: "white",
  },
};

/**
 * Props interface for the ReleaseStatus component
 * @interface ReleaseStatusProps
 * @property {Entity} entity - The entity object containing status information
 */
interface ReleaseStatusProps {
  autogovStatus: string;
}

/**
 * A React functional component that displays the release status of an entity.
 * The status is displayed as a colored chip with text indicating the current status.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Entity} props.entity - The entity object containing metadata and annotations
 *
 * @returns {JSX.Element} A Chip component displaying the status, or an empty fragment if no status exists
 *
 * @example
 * ```tsx
 * <ReleaseStatus entity={entityObject} />
 * ```
 *
 * The chip colors are:
 * - Green with white text for 'passed' status
 * - Red with black text for 'failed' status
 * - Gray with white text for other statuses
 */
const ReleaseStatus: React.FC<ReleaseStatusProps> = ({ autogovStatus }) => {
  if (autogovStatus) {
    return (
      <Chip
        label={autogovStatus.toUpperCase()}
        style={
          chipColors[autogovStatus.toLowerCase() as StatusType] ||
          chipColors.other
        }
        size="small"
      />
    );
  }
  return <></>;
};

export default ReleaseStatus;

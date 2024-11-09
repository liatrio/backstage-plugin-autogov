/**
 * Processes entities to check their autogov status from release assets
 *
 * @author Daniel Hagen <daniel.hagen@liatrio.com>
 * @author Amber Beasley <amber.beasley@liatrio.com>
 *
 * @license Apache-2.0
 *
 */

import React from "react";
import { Link } from "@backstage/core-components";
import LocalOfferOutlinedIcon from "@material-ui/icons/LocalOfferOutlined";
import styled from "styled-components";
import { OverflowTooltip } from "./OverflowTooltip";

const PolicyItem = styled.div``;

const InfoButton = styled.span`
  cursor: pointer;
`;
const TooltipText = styled.div`
  font-size: 1.5em;
  line-height: 1.5em;
`;
const PolicyItemText = styled.div`
  padding: 0.4em;
  font-size: inherit;
  vertical-align: middle;
  font-weight: normal;
  text-decoration: dotted underline;
`;

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const FailedPolicies = ({ failedPolicies }: { failedPolicies: any }) => {
  if (!failedPolicies || failedPolicies.length === 0) {
    return null;
  }
  const failedPoliciesCleaned = [...new Set(failedPolicies)]; // Remove duplicates, fast
  return (
    <>
      {failedPoliciesCleaned.map((violation: any) => {
        return (
          <PolicyItem
            key={`${violation.policy || ""}-${violation.message || ""}`}
          >
            <InfoButton>
              <OverflowTooltip
                title={
                  <TooltipText>
                    {capitalizeFirstLetter(violation.message)}
                  </TooltipText>
                }
                text={
                  <PolicyItemText>
                    {capitalizeFirstLetter(violation.policy)}
                  </PolicyItemText>
                }
              />
            </InfoButton>
          </PolicyItem>
        );
      })}
    </>
  );
};

const LinkedRelease = ({ url, name }: { url: string; name: string }) => {
  return (
    <Link color="inherit" target="_blank" rel="noopener noreferrer" to={url}>
      {name}
    </Link>
  );
};

const SubvalueWithIcon = ({ tag }: { tag: string }) => {
  return (
    <>
      <LocalOfferOutlinedIcon fontSize="inherit" /> {tag}
    </>
  );
};

export { FailedPolicies, LinkedRelease, SubvalueWithIcon };

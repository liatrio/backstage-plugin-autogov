// plugins/custom-github-release-insights/src/components/CustomInsightsPage.tsx
import React from "react";
import { Grid } from "@material-ui/core";
import {
  Page,
  Content,
  ContentHeader,
  SupportButton,
  MissingAnnotationEmptyState,
} from "@backstage/core-components";
import { isGithubInsightsAvailable } from "@roadiehq/backstage-plugin-github-insights";
import {
  ComplianceCard,
  ContributorsCard,
  ReadMeCard,
  LanguagesCard,
  EnvironmentsCard,
} from "@roadiehq/backstage-plugin-github-insights";
import { useEntity } from "@backstage/plugin-catalog-react";
import ReleasesCard from "./AutoGovReleasesCard";

export const CustomInsightsPage = () => {
  const { entity } = useEntity();

  return isGithubInsightsAvailable(entity) ? (
    <Page themeId="tool">
      <Content>
        <ContentHeader title="GitHub Insights">
          <SupportButton>Plugin to show GitHub Insights</SupportButton>
        </ContentHeader>
        <Grid container spacing={3} direction="row" alignItems="stretch">
          <Grid item sm={12} md={6} lg={4}>
            <ContributorsCard />
            <LanguagesCard />
            <ReleasesCard />
            <EnvironmentsCard />
            <ComplianceCard />
          </Grid>
          <Grid item sm={12} md={6} lg={8}>
            <ReadMeCard maxHeight={450} />
          </Grid>
        </Grid>
      </Content>
    </Page>
  ) : (
    <MissingAnnotationEmptyState annotation="placeholder" />
  );
};

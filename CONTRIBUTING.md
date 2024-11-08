# Contributing to the Backstage GitHub Releases AutoGov Plugin

## Local Testing

1. build & package the plugins

   > build & package individually for isolated local testing

   ```zsh
   yarn install
   yarn tsc
   cd backstage-plugin-github-releases-autogov
   yarn build
   yarn pack
   ```

   ```zsh
   cd ..
   yarn install
   yarn tsc
   cd backstage-plugin-github-releases-assets-backend
   yarn build
   yarn pack
   ```

   ```packages/backend/src/index.ts
   backend.add(
     import('backstage-plugin-github-releases-assets-backend'),
   );
   ```

1. Add the plugins to a local Backstage instance

   ```zsh
   cd packages/backend
   yarn add <local-path-to-repo>backstage-plugin-autogov/backstage-plugin-github-releases-autogov/liatrio-backstage-plugin-github-releases-assets-backend-<current-version>.tgz
   ## or run
   yarn --cwd packages/backend <local-path-to-repo>backstage-plugin-autogov/backstage-plugin-github-releases-autogov/liatrio-backstage-plugin-github-releases-assets-backend-<current-version>.tgz
   ```

   ```zsh
   cd packages/app
   yarn add <local-path-to-repo>backstage-plugin-autogov/backstage-plugin-github-releases-autogov/liatrio-backstage-plugin-github-releases-autogov-<current-version>.tgz
   ## or run
   yarn --cwd packages/app <local-path-to-repo>backstage-plugin-autogov/backstage-plugin-github-releases-autogov/liatrio-backstage-plugin-github-releases-autogov<current-version>.tgz
   ```

   ```packages/app/src/components/catalog/EntityPage.tsx
   import { GithubReleasesAutogovPage } from 'backstage-plugin-github-releases-autogov';
   ...

   <EntityLayout.Route
         path="/code-insights"
         title="Code Insights">
         <GithubReleasesAutogovPage />
   </EntityLayout.Route>
   ```

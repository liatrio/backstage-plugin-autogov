# Contributing to the Backstage GitHub Releases AutoGov Plugin

## Local Testing

1. build & package the plugins

   > build & package individually for isolated local testing (build, pack, and add for each plugin)

   ```zsh
   yarn install
   yarn tsc
   cd packages/backstage-plugin-github-releases-assets-backend
   yarn build
   yarn pack
   ```

1. Add the plugins to a local Backstage instance (add for each plugin package)

   ```zsh
   cd packages/backend
   yarn add <local-path-to-repo>backstage-plugin-autogov/backstage-plugin-github-releases-autogov/liatrio-backstage-plugin-github-releases-assets-backend/package.tgz
   ## or run
   yarn --cwd packages/backend <local-path-to-repo>backstage-plugin-autogov/backstage-plugin-github-releases-autogov/liatrio-backstage-plugin-github-releases-assets-backend/package.tgz
   ```
1. Add the plugin to the frontend component
   ```packages/app/src/components/catalog/EntityPage.tsx
   import { GithubReleasesAutogovPage } from 'backstage-plugin-github-releases-autogov';
   ...

   <EntityLayout.Route
         path="/code-insights"
         title="Code Insights">
         <GithubReleasesAutogovPage />
   </EntityLayout.Route>
   ```

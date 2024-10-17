# Contributing to the Backstage GitHub Releases AutoGov Plugin

## Local Testing

1. build & package the plugins

```zsh
cd backstage-plugin-github-releases-autogov
yarn build
yarn pack
```

```zsh
cd ..
cd backstage-plugin-github-releases-assets-backend
yarn build
yarn pack
```

```packages/backend/src/index.ts
backend.add(
  import('backstage-plugin-github-releases-assets-backend'),
);
```

2. Add the plugins to a local Backstage instance

```zsh
cd packages/backend
yarn add @liatrio/backstage-plugin-github-releases-assets-backend
```

```zsh
cd packages/app
yarn add @liatrio/backstage-plugin-github-releases-autogov
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

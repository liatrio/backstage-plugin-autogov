module.exports = {
  extends: [require.resolve("@backstage/cli/config/eslint")],
  ignorePatterns: ["node_modules/", "dist/", "*.d.ts", ".eslintrc.js"],
};

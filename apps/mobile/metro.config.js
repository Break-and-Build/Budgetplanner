// Monorepo-aware Metro config — required for EAS Build to resolve
// @budgetplanner/core from the workspace root, and for Metro on local dev
// to watch the shared core package for hot reload.
//
// See: https://docs.expo.dev/guides/monorepos/

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the entire workspace for changes (so edits in packages/core
//    trigger Fast Refresh in the mobile app).
config.watchFolders = [workspaceRoot];

// 2. Tell Metro where to look for node_modules: project-local first,
//    workspace root second. Hoisted modules live at the workspace root.
//
// NOTE: we intentionally KEEP hierarchical lookup enabled (Metro's default).
// Some hoisted packages (e.g. react-native-reanimated) depend on a newer
// semver than another root dep pulls up, so npm nests the correct copy
// inside the package's own node_modules. Hierarchical lookup is what lets
// Metro walk up from the requiring file and find that nested copy. Disabling
// it forces the (wrong, older) root copy and breaks the bundle.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;

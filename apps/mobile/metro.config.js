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
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Disable Metro's "hierarchical lookup" (walking up the file tree).
//    With workspaces, the explicit nodeModulesPaths list is the source
//    of truth — hierarchical lookup tends to find the wrong copy.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;

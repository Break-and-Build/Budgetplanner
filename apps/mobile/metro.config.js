const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Allow importing from the monorepo shared package (packages/core)
config.watchFolders = [path.resolve(__dirname, '../../packages/core')];

module.exports = config;

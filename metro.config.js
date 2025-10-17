const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Uses the SVG transformer
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

// Treats SVGs as source
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

module.exports = config;

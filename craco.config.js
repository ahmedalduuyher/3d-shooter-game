// Configuration for build optimization
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Optimize bundle size
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          minChunks: 1,
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          automaticNameDelimiter: '~',
          enforceSizeThreshold: 50000,
          cacheGroups: {
            defaultVendors: {
              test: /[\\/]node_modules[\\/]/,
              priority: -10
            },
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true
            }
          }
        }
      };
      
      // Optimize Three.js
      webpackConfig.module.rules.push({
        test: /three\/examples\/js/,
        use: 'imports-loader?THREE=three'
      });
      
      return webpackConfig;
    }
  }
};

const webpack = require('webpack');

module.exports = {
  webpack(config, env) {
    // config.output.library = `react-garfish-exports`;
    config.output.libraryTarget = 'umd';
    config.output.globalObject = 'window';
    config.devtool = 'source-map';
    config.output.publicPath = 'http://localhost:3000/';
    config.output.jsonpFunction = 'react-garfish-exports';
    config.mode = 'development';
    config.optimization.minimize = true;
    config.plugins.push(
      new webpack.BannerPlugin({
        raw: true,
        test: /.js$/,
        banner: '/* empty */\n',
      }),
    );
    return config;
  },

  devServer(configFunction) {
    return (proxy, allowedHost) => {
      const config = configFunction(proxy, allowedHost);
      config.open = false;
      // config.disableHostCheck = true;
      // config.compress = true;
      config.overlay = false;
      // config.hot = true;
      config.headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      };
      return config;
    };
  },
};

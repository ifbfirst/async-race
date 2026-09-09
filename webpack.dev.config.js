const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: path.resolve(__dirname, './dist'),
    proxy: [
      {
        context: ['/garage', '/winners', '/engine', '/health'],
        target: 'http://127.0.0.1:3000',
      },
    ],
  },
};

const config = {
  mode: "production",
  devtool: "source-map", //webpack.js.org/configuration/devtool

  // //babel loaders
  // module: {
  //   rules: [
  //     {
  //       //JS Loaders
  //       test: /\.js$/,
  //       exclude: path.resolve(__dirname, 'node_modules'),
  //       use: {
  //         loader: 'babel-loader',
  //         options: {
  //           presets: ['@babel/preset-env']
  //         }
  //       }
  //     }
  //   ]
  // }


};

module.exports = config;

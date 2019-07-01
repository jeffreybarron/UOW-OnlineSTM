const commonConfig = require("./build-utils/webpack.common.js");
const webpackMerge = require("webpack-merge");

module.exports = (env) => {
  //define entry point
  //define output point

  console.log('++++++++++++++++++++++++++++++');
  console.log('Environment: ', env);
  console.log('Output.path: ', commonConfig.output.path)
  console.log('++++++++++++++++++++++++++++++');

  const envConfig = require(`./build-utils/webpack.${env.env}.js`);

  return webpackMerge(commonConfig, envConfig);

}
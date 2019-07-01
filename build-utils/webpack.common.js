const webpack = require("webpack");
const commonPaths = require("./common-paths.js")

const config = {
  entry: {
    main: './routes/src/ostm/js/main.js',
    participant: './routes/src/ostm/js/participant.js',
    consent: './routes/src/ostm/js/consent.js',
    instructions: './routes/src/ostm/js/instructions.js',
    study: './routes/src/ostm/js/study.js',
    completion: './routes/src/ostm/js/completion.js',
    guide: './routes/src/ostm/js/guide.js',
    deckNew: './routes/src/ostm/js/deckNew.js',
    studyCreate: './routes/src/ostm/js/studyCreate.js',
    studyDuplicate: './routes/src/ostm/js/studyDuplicate.js'
  },
  output: {
    filename: '[name].js',
    path: commonPaths.outputPath
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.$': 'jquery',
      'window.jQuery': 'jquery'
    })
  ],
  target: 'web'
};

module.exports = config;
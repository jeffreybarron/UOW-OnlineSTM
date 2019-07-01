const path = require("path");

module.exports = {
  //define entry point
  mode: 'web',

  entry: {
    completion: './routes/src/ostm/js/completion.js',
    consent: './routes/src/ostm/js/consent.js',
    deckNew: './routes/src/ostm/js/deckNew.js',
    guide: './routes/src/ostm/js/guide.js',
    instructions: './routes/src/ostm/js/main.js',
    main: './routes/src/ostm/js/main.js',
    participant: './routes/src/ostm/js/participant.js',
    study: './routes/src/ostm/js/study.js',
    studyCreate: './routes/src/ostm/js/studyCreate.js',
    studyDuplicate: './routes/src/ostm/js/studyDuplicate.js'
  },

  //define output point
  output: {
    path: path.resolve(__dirname, '../routes/ostm/public/js'),
    filename: '[name].js'
    // filename: './bundle.js'
  },

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
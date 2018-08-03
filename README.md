# Webpack Boiler[plate]
My personal webpack configuration. Feel free to fork!

## Features
- Babel (es6)
- React (with hot reloading)
- HTML templates (pug)

## Install
`npm i -S webpack-boiler`

## Usage
__webpack.config.js__
```JavaScript
// All config parameters are optional
module.exports = require('webpack-boiler')({
  react: true, // default: false
  pages = [{ // config for each instance of HTMLWebpackPlugin
    filename: 'index.html',
    favicon: './src/favicon.ico',
  }],
  env = { // Pass process.env variables to bundle
    PRIVATE_KEY: 'abc',
  },
  entry = { // Webpack entry points
    some_chunk: './src/some_chunk.js',
  },
  googleAnalytics: 'U-XXXXXXX', // Google Analytics ID
  basename = 'good-for-gh-pages', // Basename of website
  url = 'https://mysite.com', // Passed to process.env as URL
});

```

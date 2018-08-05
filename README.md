# Webpack Boiler[plate]
[![npm version](https://badge.fury.io/js/webpack-boiler.svg)](https://badge.fury.io/js/webpack-boiler)

Another webpack configuration boilerplate. Great for modern React PWAs.

## Features
- Babel (es6 and React)
- HTML templates (Jade / [Pug](https://pugjs.org))
- Web workers (any file ending in `.worker.js`)
- Everything hot reloads

## Install
```bash
$ npm i -D webpack-boiler
```

## Usage
Create the file __webpack.config.js__ with the following contents:
```JavaScript
// ALL config parameters are optional
module.exports = require('webpack-boiler')({
  react: false, // <- default
  pages: [{ // config for each instance of HTMLWebpackPlugin
    title: 'Title of page!',
    filename: 'index.html', // Output filename
    chunks: ['main','vendor'], // Custom chunks
    favicon: './src/favicon.ico', // Path to favicon
    scripts: [{ src: '/script.js' }], // Custom <head> script attributes
    bodyScripts: [], // Same as above, but at end of <body>
    links: [{ href: '/style.css', rel: 'stylesheet' }], // Custom link attributes
    meta: [{ name: 'foo', content: 'bar' }], // Custom <meta> attributes
    lang: 'en-US', // <- default
    appMountId: 'root', // <- default if react is enabled
    mobile: true, // <- default. Set to false to disable mobile viewport
    cache: true, // <- default. Set to false to disable HTML caching
    template: './src/custom_template.pug', // Custom page template (see below)
  }],
  env: { // Pass process.env variables to bundle
    PRIVATE_KEY: 'abc',
  },
  entry: { // Webpack entry points
    some_chunk: './src/some_chunk.js',
  },
  googleAnalytics: 'U-XXXXXXX', // Google Analytics ID
  basename: 'good-for-gh-pages', // Basename of website
  url: 'https://mysite.com', // Passed to process.env as `URL` (set to `http://localhost:<devPort>` during development)
  devPort: 8080, // <- default
});

```

Then run one of:
- __Development__:
```bash
$ NODE_ENV=development webpack-dev-server
```
- __Production__:
```bash
$ NODE_ENV=production webpack
```


## Custom Template
Set the relative path to a custom template in the `template` config parameter. Structure the custom template like so:
```pug
extends ./node_modules/webpack-boiler/template.pug
// ^ Path may differ depending on this file's location

block page_content
  h1 Here's the custom content!
  <p>You can write in the Jade/Pug style or in HTML</p>
```
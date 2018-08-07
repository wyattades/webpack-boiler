# Webpack Boiler[plate]
Another webpack configuration boilerplate. Great for modern React PWAs.

[![npm version](https://badge.fury.io/js/webpack-boiler.svg)](https://badge.fury.io/js/webpack-boiler)

In your project root, create the file __webpack.config.js__ containing:
```js
module.exports = require('webpack-boiler')({
  react: true,
  pages: [{
    title: 'Hello World!',
  }],
});
```

## Features
- Babel (es6 and React)
- Sass
- HTML templates (Jade / [Pug](https://pugjs.org))
- Web workers (any file ending in `.worker.js`)
- Uglified/minified JS, CSS, & HTML
- CSS [autoprefixer](https://github.com/postcss/autoprefixer)
- Hot Reloading (For React, follow the [react-hot-loader API](https://github.com/gaearon/react-hot-loader#getting-started))

## Install
```bash
$ npm i --save-dev webpack-boiler
```

## Usage
- __Development__ (your project will hot-reload at http://localhost:8080):
```bash
$ NODE_ENV=development webpack-dev-server
```
- __Production Build__:
```bash
$ NODE_ENV=production webpack
```

## API

### `webpackBoiler([config])`

**Returns**: <code>Object</code> - [webpackConfigObject](https://webpack.js.org/configuration/)  

```js
var webpackBoiler = require('webpack-boiler');
var webpackConfigObject = webpackBoiler({ /* config */ });
```

### Config Parameters
All config parameters are optional

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [react] | <code>boolean</code> | <code>false</code> | Enable React Babel and react-hot-loader |
| [entry] | <code>Object</code> | <code>{}</code> | Webpack entry points. Has default entry: `main: 'src/index.js'` (Use absolute paths) |
| [env] | <code>Object</code> | <code>{}</code> | Variables passed to source code in `process.env` |
| [googleAnalytics] | <code>string</code> |  | Google Analytics ID |
| [basename] | <code>string</code> |  | Basename of website. This is helpful for GithubPages websites e.g. `webpack-boiler` for `wyattades.github.io/webpack-boiler` |
| [url] | <code>string</code> |  | Passed to process.env as `URL` (is set to `http://localhost:<devPort>` during development) |
| [devPort] | <code>number</code> | <code>8080</code> | Development port number |
| [pages] | <code>Array.&lt;Object&gt;</code> | <code>[{}]</code> | Array of html-webpack-plugin config objects |
| [pages[].title] | <code>string</code> |  | Title of page |
| [pages[].filename] | <code>string</code> | <code>&quot;index.html&quot;</code> | Output filename |
| [pages[].chunks] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | Webpack chunks to include e.g. `['main','vendor']` |
| [pages[].favicon] | <code>string</code> |  | Path to favicon |
| [pages[].scripts] | <code>Array.&lt;Object&gt;</code> | <code>[]</code> | Array of `script` element attributes appended to `head` e.g. `[{ src: 'script.js' }]` |
| [pages[].bodyScripts] | <code>Array.&lt;Object&gt;</code> | <code>[]</code> | Same as `.scripts` but appended to `body` |
| [pages[].links] | <code>Array.&lt;Object&gt;</code> | <code>[]</code> | Same as `.scripts` but for `link` element |
| [pages[].meta] | <code>Array.&lt;Object&gt;</code> | <code>[]</code> | Same as `.scripts` but for `meta` element |
| [pages[].lang] | <code>string</code> | <code>&quot;en-US&quot;</code> | HTML language |
| [pages[].appMountId] | <code>string</code> | <code>&quot;root&quot;</code> | React root element ID. Only enabled if `react=true` |
| [pages[].cache] | <code>boolean</code> | <code>true</code> | Set to false to disable page caching |
| [pages[].mobile] | <code>boolean</code> | <code>true</code> | Set to false to disable mobile viewport |
| [pages[].template] | <code>string</code> |  | Relative path to custom template |


## Custom Template
Set the relative path to a custom template in the `template` config parameter. Structure the custom template like so:
```pug
extends ./node_modules/webpack-boiler/template.pug
// ^ Path may differ depending on this file's location

block page_content
  h1 Here's the custom content!
  <p>You can write in the Jade/Pug style or in HTML</p>
```

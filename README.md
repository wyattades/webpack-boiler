# Webpack Boiler[plate]
> Webpack configuration boilerplate. Great for easily configuring React or vanilla Progressive Web Apps.

[![npm](https://badge.fury.io/js/webpack-boiler.svg)](https://badge.fury.io/js/webpack-boiler)

## Features
- Babel (es6, modules, and React)
- SCSS & [autoprefixer](https://github.com/postcss/autoprefixer)
- HTML templates (Jade / [Pug](https://pugjs.org))
- Web App Manifest and service worker
- Web workers
- Uglified/minified JS, CSS, & HTML
- Hot Reloading (For your React code, follow the [react-hot-loader API](https://github.com/gaearon/react-hot-loader#getting-started))

## Install
```bash
npm install --save-dev webpack-boiler
```

## Usage
In your project root, create the file __webpack.config.js__ containing:
```js
module.exports = require('webpack-boiler')({
  react: true,
  pages: [{
    title: 'Hello World!',
  }],
});
```
This creates a webpack configuration with default entry point: `<project_root>/src/index.js`

(NOTE: Only source files in the `src` directory will be read!)

To develop and bundle your app, add the following commands to your `package.json`'s scripts:
- __Development__ (your project will hot-reload at http://localhost:8080):
```json
"dev": "cross-env NODE_ENV=development webpack-dev-server"
```
- __Production Build__ (your project will build to the `./dist` directory):
```json
"build": "cross-env NODE_ENV=production webpack"
```

_You can also view an example app [here](https://github.com/wyattades/personal-site/)._

## API

### `webpackBoiler(config?)`

**Returns**: `Object` - [webpackConfigObject](https://webpack.js.org/configuration/)  

```js
var webpackBoiler = require('webpack-boiler');
var webpackConfigObject = webpackBoiler({ /* config */ });
```

### Config Object
All config parameters are optional

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| react | `boolean` | `false` | Enable React Babel and react-hot-loader |
| entry | `Object` | `{}` | Webpack entry points. Has default entry: `index: '<project_root>/src/index.js'` (Must use absolute paths) |
| env | `Object` | `{}` | Variables passed to source code in `process.env` |
| googleAnalytics | `string` |  | Google Analytics ID |
| basename | `string` |  | Basename of website. This is helpful for GithubPages websites e.g. `webpack-boiler` for `wyattades.github.io/webpack-boiler` |
| url | `string` |  | Passed to `process.env` as `URL` (is set to `http://localhost:<devPort>` during development) |
| devPort | `number` | `8080` | Development port number |
| manifest | `Object` | `null` | Web App [manifest config](https://developer.mozilla.org/en-US/docs/Web/Manifest) (if object, then autofills `description`, `name`, `icons`, and `lang`) |
| offline | `boolean` | `false` | Offline cache your bundle assets. Defaults to `true` if `manifest` is provided. You can also provide an Object for custom [offline-plugin](https://github.com/NekR/offline-plugin/blob/master/docs/options.md) options |
| pages | `Object[]` | `[{}]` | Array of html page config objects (defaults to a single `index.html` file) |
| pages[].filename | `string` | `'index.html'` | Output filename |
| pages[].title | `string` |  | Title of page |
| pages[].meta | `Object` | `{}` | Inject `meta`-tags e.g. `{ description: 'wow!' }` |
| pages[].chunks | `string[]` | `['index']` | Webpack chunks to include. Corresponds to the keys in `entry` |
| pages[].favicon | `string` |  | Path to favicon.ico |
| pages[].lang | `string` | `'en-US'` | HTML language |
| pages[].appMountId | `string` | `'root'` | React root element ID. Only enabled if `react=true` |
| pages[].cache | `boolean` | `true` | Set to false to disable page caching |
| pages[].mobile | `boolean` | `true` | Set to false to disable mobile viewport |
| pages[].template | `string` |  | Relative path to [custom pug template](#custom-templates) |
| pages[].headElements | `Object[]` | `[]` | Append extra elements to `<head>` with an array of element attributes, where `tag` is the element's tag e.g. `[{ tag: 'link', rel: 'stylesheet', href: 'style.css' }]` |
| pages[].bodyElements | `Object[]` | `[]` | Same as `headElements` but appended to the end of `<body>` |

## Manifest
To truly create a Progressive Web App, you need to provide an object to the `manifest` config parameter. This will produce a `manifest.json` file as well as a service worker
(`sw.js`) that caches the files on your website (using [offline-plugin](https://www.npmjs.com/package/offline-plugin)).

## Custom Templates
Set the relative path to a custom `pug` template in the `template` config parameter. I recommend to structure the custom template like so:

__example_template.pug__
```pug
// Extend our `pug` template (Path may differ depending on example_template.pug's location)
extends ./node_modules/webpack-boiler/template.pug

// Put your content in a `block` with the name 'page_content'
block page_content
  h1 Here's the custom content!
  <p>You can write in the Jade/Pug style or in HTML</p>
```

## Web Workers
Create [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) using the [worker-loader](https://github.com/webpack-contrib/worker-loader) plugin.
A worker is any source file ending in `.worker.js` or imported using `worker-loader`. 

__Example:__
```js
import Foo from './Foo.worker.js';
// or
import Bar from 'worker-loader!./Bar.js';
```

## Default (Opinionated) Behaviors
- The bundle output directory is `dist`
- Importing CSS into your source code results in an extracted `.css` file (using [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin))
- CSS and JS bundle filenames are appended with the hash of that file e.g. `index.0435m918429fjsaa832l.js`
- Files in `<project_root>/src/static` are automatically copied to the bundle output (and retain their folder structure) if you add the following to your source code:
  ```js
  require.context('./static', true);
  ```
- Images imported in your source code are placed in an `assets` directory in your bundle
- I suggest providing a `.ico` or `.png` favicon file with size 192x192 (you can include additional sizes in the `.ico` file)

## DISCLAIMER
This package is still in development and is constantly changing. Please report discrepencies to [Github issues](https://github.com/wyattades/webpack-boiler/issues).

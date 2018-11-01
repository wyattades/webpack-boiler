/**
 * @module webpackBoiler
 */


if (!(process.env.NODE_ENV in { production: 0, development: 0 }))
  throw new Error('Please set NODE_ENV environment variable to "production" or "development"');

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const autoprefixer = require('autoprefixer');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const DEV = process.env.NODE_ENV !== 'production';

const PATHS = {};
PATHS.callerDirname = path.dirname(module.parent.filename);
PATHS.dist = path.resolve(PATHS.callerDirname, 'dist');
PATHS.src = path.resolve(PATHS.callerDirname, 'src');
PATHS.template = path.resolve(__dirname, 'template.pug');
PATHS.static = path.resolve(PATHS.src, 'static');
PATHS.entry = path.resolve(PATHS.src, 'index.js');

/**
 * @param {Object} [config]
 * @param {boolean} [config.react=false] - Enable React Babel and react-hot-loader
 * @param {Object} [config.entry={}] - Webpack entry points. Has default entry: `index: '<project_root>/src/index.js'` (Use absolute paths)
 * @param {Object} [config.env={}] - Variables passed to source code in `process.env`
 * @param {string} [config.googleAnalytics] - Google Analytics ID
 * @param {Object} [config.manifest=null] - Web App manifest config (if object, then autofills `description`, `name`, `icons`, and `lang`)
 * @param {boolean} [config.offline=false] - Offline cache your bundle assets. Defaults to `true` if `manifest` is provided. You can also provide an Object for custom [offline-plugin](https://github.com/NekR/offline-plugin/blob/master/docs/options.md) options
 * @param {string} [config.basename] - Basename of website. This is helpful for GithubPages websites e.g. `webpack-boiler` for `wyattades.github.io/webpack-boiler`
 * @param {string} [config.url] - Passed to process.env as `URL` (is set to `http://localhost:<devPort>` during development)
 * @param {number} [config.devPort=8080] - Development port number
 * @param {Object[]} [config.pages=[{}]] - Array of html page config objects (defaults to a single `index.html` file) 
 * @param {string} [config.pages[].title] - Title of page
 * @param {string} [config.pages[].filename=index.html] - Output filename
 * @param {Object} [config.pages[].meta={}] - Inject `meta`-tags e.g. `{ description: 'wow!' }`
 * @param {string[]} [config.pages[].chunks=['index']] - Webpack chunks to include e.g. `['index','vendor']`
 * @param {string} [config.pages[].favicon] - Path to favicon
 * @param {Object[]} [config.pages[].headElements=[]] - Append extra elements to `<head>` with an array of element attributes, where tag is the element's tag e.g. `[{ tag: 'link', rel: 'stylesheet', href: 'style.css' }]`
 * @param {Object[]} [config.pages[].bodyElements=[]] - Append extra elements to `<body>` with an array of element attributes, where tag is the element's tag e.g. `[{ tag: 'script', src: 'myScript.js' }]`
 * @param {string} [config.pages[].lang=en-US] - HTML language
 * @param {string} [config.pages[].appMountId=root] - React root element ID. Only enabled if `react=true`
 * @param {boolean} [config.pages[].cache=true] - Set to false to disable page caching
 * @param {boolean} [config.pages[].mobile=true] - Set to false to disable mobile viewport
 * @param {string} [config.pages[].template] - Relative path to custom `pug` template
 * @returns {Object} [webpackConfigObject](https://webpack.js.org/configuration/)
*/
module.exports = (config) => {

  let {
    react,
    pages = [{}],
    manifest,
    offline,
    env = {},
    googleAnalytics,
    entry = {},
    basename = '',
    url = '',
    devPort = 8080,
  } = config || {};

  // Reformat arguments:

  if (!Array.isArray(pages)) pages = [pages];

  if (!entry.index) entry.index = PATHS.entry;

  const definedEnvs = {
    DEV,
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    BASENAME: JSON.stringify(basename),
    URL: JSON.stringify(!DEV ? url : `http://localhost:${devPort}`),
  };
  for (const key in env) {
    definedEnvs[key] = JSON.stringify(env[key]);
  }

  if (basename)
    basename = '/' + basename.replace(/(^\/)|(\/$)/g, '');

  for (const page of pages) {

    if (!DEV)
      Object.assign(page, {
        minify: {
          collapseWhitespace: true,
          preserveLineBreaks: true,
          minifyJS: true,
        },
        googleAnalytics,
      });

    Object.assign(page, {
      url,
      manifest,
    });

    page.appMountId = page.appMountId || (react ? 'root' : null);

    page.inject = false;
    page.template = page.template ? path.resolve(PATHS.callerDirname, page.template) : PATHS.template;
    if (page.favicon) page.favicon = path.resolve(PATHS.callerDirname, page.favicon);
  
  }

  // base Webpack config
  const baseConfig = {

    mode: process.env.NODE_ENV,

    context: __dirname,
    
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          loader: 'worker-loader',
          include: PATHS.src,
        }, {
          test: /\.js$/,
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            minified: !DEV,
            presets: [
              ...react ? ['@babel/react'] : [],
              ['@babel/env', {
                modules: false,
              }],
            ],
            plugins: [
              ...react ? ['react-hot-loader/babel'] : [],
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-syntax-dynamic-import',
            ],
          },
          include: PATHS.src,
        }, {
          test: /\.(pug|jade)$/,
          loader: 'pug-loader',
        }, {
          test: /\.s?css$/,
          use: [
            DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                // TODO: necessary? use webpack's browserlist?
                plugins: () => [ autoprefixer() ],
              },
            },
            'sass-loader',
          ],
          include: PATHS.src,
        }, {
          test: /\.(gif|jpe?g|png|svg|ttf|eot|woff|woff2)(\?\w+=[\d.]+)?$/,
          loader: 'file-loader',
          options: {
            name: 'asset/[name].[ext]',
          },
          exclude: PATHS.static,
        }, {
          type: 'javascript/auto',
          loader: 'file-loader',
          options: {
            name: '[path][name].[ext]',
            context: PATHS.static,
          },
          include: PATHS.static,
        },
      ],
    },
  };

  // base Webpack plugins
  const sharedPlugins = [

    new webpack.DefinePlugin({
      'process.env': definedEnvs,
    }),

    new MiniCssExtractPlugin({
      filename: DEV ? '[name].css' : '[name].[hash].css',
      allChunks: true,
    }),

    ...pages.map((page) => new HtmlWebpackPlugin(page)),

  ];

  if (manifest && typeof manifest === 'object') {

    if (!manifest.start_url)
      throw 'Must include "start_url" property in manifest e.g. "https://example.com/home"';

    const page = pages[0];
    if (!manifest.lang) manifest.lang = page.lang;
    if (!manifest.name && page.title) manifest.name = page.title;
    if (!manifest.description && page.meta && page.meta.description) manifest.description = page.meta.description;
    if (!manifest.theme_color && page.meta && page.meta['theme-color']) manifest.theme_color = page.meta['theme-color'];
    if (!manifest.icons && page.favicon) manifest.icons = [{
      src: '/' + path.basename(page.favicon),
      sizes: '192x192',
    }];
    
    class WriteManifestPlugin {
      apply(compiler) {
        compiler.hooks.emit.tap('WriteManifestPlugin', (compilation) => {        
          const manifestFile = JSON.stringify(manifest);
          compilation.assets['manifest.json'] = {
            source: () => manifestFile,
            size: () => manifestFile.length,
          };
        });
      }
    }

    sharedPlugins.push(new WriteManifestPlugin());
  }

  if (offline !== false && (offline || (manifest && typeof manifest === 'object'))) {
    const config = {
      appShell: basename || '/',
    };
    if (typeof offline === 'object' && offline !== null)
      Object.assign(config, offline);
    
    sharedPlugins.push(new OfflinePlugin(config));
  }

  if (!DEV) { // PRODUCTION CONFIG

    return Object.assign({
      
      entry,

      output: {
        path: PATHS.dist,
        publicPath: `${basename}/`,
        filename: '[name].[chunkhash].js',
      },

      plugins: [

        new CleanWebpackPlugin([ PATHS.dist ], { allowExternal: true }),

        ...sharedPlugins,

        new BundleAnalyzerPlugin({
          analyzerMode: process.env.BUNDLE_STATS || 'disabled',
        }),
              
        new webpack.optimize.OccurrenceOrderPlugin(),

        // new UglifyJsPlugin({
        //   parallel: true,
        // }),

        new OptimizeCssAssetsPlugin({
          cssProcessorOptions: { discardComments: { removeAll: true } },
        }),
        
      ],

    }, baseConfig);

  } else { // DEVELOPMENT CONFIG

    return Object.assign({

      devtool: 'eval-source-map',

      output: {
        publicPath: '/',
        globalObject: 'this',
      },

      devServer: {
        hot: true,
        historyApiFallback: true,
        port: devPort,
        watchContentBase: true,
      },

      entry,

      plugins: [

        ...sharedPlugins,

        new webpack.NamedModulesPlugin(),

        new webpack.HotModuleReplacementPlugin(),
      ],
      
    }, baseConfig);

  }
};

/**
 * @module webpackBoiler
 */

const warn = (...msg) =>
  console.log('\x1b[1m\x1b[33mwebpack-boiler:\x1b[0m', ...msg);
const fatal = (...msg) => {
  throw new Error(
    `\x1b[1m\x1b[31mwebpack-boiler:\x1b[0m ${msg.map((m) => `${m}`).join(' ')}`,
  );
};

if (!(process.env.NODE_ENV in { production: 0, development: 0 }))
  fatal(
    'Please set NODE_ENV environment variable to "production" or "development"',
  );

const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const DEV = process.env.NODE_ENV === 'development';

const PATHS = {};
PATHS.callerDirname = path.dirname(module.parent.filename);

const callerPath = (relPath) => path.resolve(PATHS.callerDirname, relPath);

PATHS.src = callerPath('src');
PATHS.template = path.resolve(__dirname, 'template.pug');
PATHS.publicDir = callerPath('public');
PATHS.entry = path.resolve(PATHS.src, 'index');

const isEmpty = (obj) => {
  if (!obj) return true;
  for (const _ in obj) return false;
  return true;
};

const hasModule = (moduleName) => {
  try {
    require.resolve(moduleName, {
      paths: [PATHS.callerDirname],
    });
    return true;
  } catch (_) {}
  return false;
};

const fileExists = (filepath) => {
  try {
    return fs.statSync(filepath).isFile();
  } catch (_) {}
  return false;
};
const dirExists = (filepath) => {
  try {
    return fs.statSync(filepath).isDirectory();
  } catch (_) {}
  return false;
};

class WebpackBoilerWriteAssetsPlugin {
  constructor(writeFiles = {}) {
    this.writeFiles = writeFiles;
  }

  /** @param {webpack.Compiler} compiler */
  apply(compiler) {
    if (isEmpty(this.writeFiles)) return;

    compiler.hooks.compilation.tap(this.constructor.name, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: this.constructor.name,
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,
        },
        () => {
          for (const filename in this.writeFiles) {
            compilation.emitAsset(
              'manifest.json',
              new webpack.sources.RawSource(this.writeFiles[filename]),
            );
          }
        },
      );
    });
  }
}

// a set of default `babel-plugin-import` options for a few popular libraries
const BABEL_PLUGIN_IMPORT_MODULES = [
  {
    libraryName: 'react-use',
    libraryDirectory: 'lib',
    camel2DashComponentName: false,
  },
  {
    libraryName: 'date-fns',
    libraryDirectory: '',
    camel2DashComponentName: false,
  },
  {
    libraryName: 'lodash',
    libraryDirectory: '',
    camel2DashComponentName: false,
  },
  {
    libraryName: 'ramda',
    libraryDirectory: 'src',
    camel2DashComponentName: false,
  },
];

/**
 * @param {Object} [config]
 * @param {boolean} [config.react=false] - Enable React Babel and react-hot-loader
 * @param {Object} [config.entry={}] - Webpack entry points. Has default entry: `index: '<project_root>/src/index.js'` (Use absolute paths)
 * @param {Object} [config.env={}] - Variables passed to source code in `process.env`
 * @param {string} [config.googleAnalytics] - Google Analytics ID
 * @param {Object} [config.manifest=null] - Web App manifest config (if object, then autofills `description`, `name`, `icons`, and `lang`)
 * @param {boolean} [config.offline=false] - Offline cache your bundle assets. Defaults to `true` if `manifest` is provided. You can also provide an Object for custom [workbox-webpack-plugin](https://developers.google.com/web/tools/workbox/modules/workbox-webpack-plugin) options
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
 * @return {webpack.Configuration}
 */
module.exports = (config) => {
  let {
    react: withReact,
    pages = [{}],
    manifest,
    offline,
    env = {},
    googleAnalytics,
    entry = {},
    basename = '',
    url = '',
    devPort = 8080,
    output = 'dist',
  } = config || {};

  // Reformat arguments:

  output = callerPath(output);

  if (!Array.isArray(pages)) {
    if (typeof pages === 'object') pages = [pages];
    else fatal('Config option "pages" must be an object or array');
  }

  if (entry === null || typeof entry !== 'object')
    fatal('Config option "entry" must be an object');

  if (DEV) url = `http://localhost:${devPort}`;

  for (const key in entry) {
    entry[key] = callerPath(entry[key]);
  }

  if (isEmpty(entry)) entry.index = PATHS.entry;

  const definedEnvs = {
    DEV,
    NODE_ENV: process.env.NODE_ENV,
    BASENAME: basename,
    URL: url,
    ...env,
  };
  for (const key in definedEnvs) {
    definedEnvs[key] = JSON.stringify(definedEnvs[key]);
  }

  if (basename) basename = '/' + basename.replace(/(^\/)|(\/$)/g, '');

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

    page.lang = page.lang || 'en-US';

    page.appMountId = page.appMountId || (withReact ? 'root' : null);

    page.inject = false;
    page.template = page.template ? callerPath(page.template) : PATHS.template;
    if (page.favicon) page.favicon = callerPath(page.favicon);

    page._headElements = (page.headElements || []).map((el) => {
      const { tag, ...attr } = el || {};
      if (!tag) fatal('No tag attribute in headElement');
      return { tag, attr };
    });

    page._bodyElements = (page.bodyElements || []).map((el) => {
      const { tag, ...attr } = el || {};
      if (!tag) fatal('No tag attribute in bodyElement');
      return { tag, attr };
    });
  }

  const babelPluginImportPlugins = DEV
    ? []
    : BABEL_PLUGIN_IMPORT_MODULES.map((m) => {
        if (hasModule(m.libraryName)) {
          return ['import', m, `webpack-boiler-import-${m.libraryName}`];
        }
        return null;
      }).filter(Boolean);

  const withReactHotLoader = hasModule('react-hot-loader');
  const withReactHotLoaderDomPatch = hasModule('@hot-loader/react-dom');

  const withTypescript = fileExists(callerPath('tsconfig.json'));

  const withPublicDir = dirExists(PATHS.publicDir);

  // base Webpack config
  /** @type {webpack.Configuration} */
  const baseConfig = {
    mode: process.env.NODE_ENV,

    entry,

    context: __dirname,

    resolve: {
      alias: withReactHotLoaderDomPatch
        ? {
            'react-dom': '@hot-loader/react-dom',
          }
        : {},
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },

    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          loader: 'worker-loader',
          include: PATHS.src,
        },
        {
          test: /\.[tj]sx?$/,
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  modules: false,
                },
              ],
              ...(withTypescript ? ['@babel/preset-typescript'] : []),
              ...(withReact
                ? [['@babel/preset-react', { development: DEV }]]
                : []),
            ],
            plugins: [
              ...(withReactHotLoader ? ['react-hot-loader/babel'] : []),
              ['@babel/plugin-proposal-class-properties', { loose: true }],
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-transform-runtime',
              ...babelPluginImportPlugins,
            ],
          },
          include: PATHS.src,
        },
        {
          test: /\.(pug|jade)$/,
          loader: 'pug-loader',
        },
        {
          test: /\.(s?css|sass)$/,
          use: [
            DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            ...(DEV
              ? []
              : [
                  {
                    loader: 'postcss-loader',
                    options: {
                      postcssOptions: {
                        plugins: ['postcss-preset-env'],
                      },
                    },
                  },
                ]),
            'sass-loader',
          ],
          include: PATHS.src,
        },
        {
          test: /\.(gif|jpe?g|png|svg|ttf|eot|woff|woff2)(\?\w+=[\d.]+)?$/,
          loader: 'file-loader',
          options: {
            name: 'asset/[name].[ext]',
          },
          exclude: PATHS.publicDir,
        },
        // {
        //   type: 'javascript/auto',
        //   loader: 'file-loader',
        //   options: {
        //     name: '[path][name].[ext]',
        //     context: PATHS.publicDir,
        //   },
        //   include: PATHS.publicDir,
        // },
      ],
    },
  };

  // base Webpack plugins
  const sharedPlugins = [
    new webpack.DefinePlugin({
      'process.env': definedEnvs,
    }),

    new MiniCssExtractPlugin({
      filename: DEV ? '[name].css' : '[name].[fullhash].css',
    }),

    ...pages.map((page) => new HtmlWebpackPlugin(page)),
  ];

  if (manifest && typeof manifest === 'object') {
    const page = pages[0] || {};
    if (!manifest.lang && page.lang) manifest.lang = page.lang;
    if (!manifest.name && page.title) manifest.name = page.title;
    if (!manifest.description && page.meta && page.meta.description)
      manifest.description = page.meta.description;
    if (!manifest.theme_color && page.meta && page.meta['theme-color'])
      manifest.theme_color = page.meta['theme-color'];
    if (!manifest.icons && page.favicon)
      manifest.icons = [
        {
          src: '/' + path.basename(page.favicon),
          sizes: '192x192',
        },
      ];
    if (!manifest.start_url && url) manifest.start_url = url;

    const missing = [
      'lang',
      'name',
      'display',
      'description',
      'theme_color',
      'icons',
      'start_url',
    ].filter((key) => !manifest[key]);
    if (missing.length)
      warn(
        'PWA guidelines suggest that you add the following properties to your manifest file: ' +
          missing +
          '\n',
      );

    sharedPlugins.push(
      new WebpackBoilerWriteAssetsPlugin({
        'manifest.json': JSON.stringify(manifest),
      }),
    );
  }

  if (
    offline !== false &&
    (offline || (manifest && typeof manifest === 'object'))
  ) {
    sharedPlugins.push(
      new GenerateSW({
        swDest: 'sw.js',
        ...(typeof offline === 'object' && offline !== null ? offline : {}),
      }),
    );
  }

  if (!DEV) {
    // PRODUCTION CONFIG

    /** @type {webpack.Configuration} */
    return {
      output: {
        path: output,
        publicPath: `${basename}/`,
        filename: '[name].[chunkhash].js',
      },

      plugins: [
        new CleanWebpackPlugin({
          dangerouslyAllowCleanPatternsOutsideProject:
            config.dangerouslyAllowCleanPatternsOutsideProject,
        }),

        new CssMinimizerPlugin(),

        ...(withPublicDir
          ? [
              new CopyWebpackPlugin({
                patterns: [{ from: PATHS.publicDir, to: '.' }],
              }),
            ]
          : []),

        ...sharedPlugins,

        new BundleAnalyzerPlugin({
          analyzerMode: process.env.BUNDLE_STATS || 'disabled',
        }),
      ],

      ...baseConfig,
    };
  } else {
    // DEVELOPMENT CONFIG

    /** @type {webpack.Configuration} */
    return {
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
        ...(withPublicDir ? { contentBase: PATHS.publicDir } : {}),
      },

      plugins: [...sharedPlugins],

      ...baseConfig,
    };
  }
};

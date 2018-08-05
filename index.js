
if (!(process.env.NODE_ENV in { production: 0, development: 0 }))
  throw new Error('Please set NODE_ENV environment variable to "production" or "development"');

const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');

const DEV = process.env.NODE_ENV !== 'production';

const PATHS = {};
PATHS.callerDirname = path.dirname(module.parent.filename);
PATHS.dist = path.resolve(PATHS.callerDirname, 'dist');
PATHS.src = path.resolve(PATHS.callerDirname, 'src');
PATHS.template = path.resolve(__dirname, 'template.pug');
PATHS.static = path.resolve(PATHS.src, 'static');
PATHS.entry = path.resolve(PATHS.src, 'index.js');

/**
 * Custom webpack config
 * @param {Object} config
 * @param {boolean} config.react
 * @param {Object[]} config.pages
 * @param {Object} config.env
 * @param {Object} config.entry
 * @param {string} config.googleAnalytics
 * @param {string} config.basename
 * @param {string} config.url
 */
module.exports = ({
  react,
  pages = [{}],
  env = {},
  googleAnalytics,
  entry = {},
  basename = '',
  url = '',
}) => {

  // Reformat arguments:

  if (!Array.isArray(pages)) pages = [pages];

  entry = {
    index: PATHS.entry,
    ...entry,
  };

  const definedEnvs = {
    NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    BASENAME: JSON.stringify(basename),
    URL: JSON.stringify(!DEV ? url : 'http://localhost:8080'),
  };
  for (const key in env) {
    definedEnvs[key] = JSON.stringify(env[key]);
  }

  if (basename)
    basename = '/' + basename.replace(/(^\/)|(\/$)/g, '');

  // base Webpack config
  const baseConfig = {

    mode: process.env.NODE_ENV,

    context: __dirname,
    
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          loader: 'worker-loader',
        }, {
          test: /\.js$/,
          use: [{
            loader: 'babel-loader',
            options: {
              presets: [
                ...react ? ['@babel/react'] : [],
                '@babel/env'
              ],
              plugins: [
                ...react ? ['react-hot-loader/babel'] : [],
                '@babel/plugin-proposal-class-properties'
              ],
            },
          }],
          include: PATHS.src,
        }, {
          test: /\.pug$/,
          loader: 'pug-loader',
        }, {
          test: /\.s?css$/,
          use: [
            DEV ? 'style-loader' : MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                autoprefixer: false,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [ autoprefixer() ],
              },
            },
            'sass-loader',
          ],
          include: PATHS.css,
        }, {
          test: /\.(gif|jpe?g|png|svg|ttf|eot|woff|woff2)(\?\w+=[\d.]+)?$/,
          use: [ {
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'asset/[name].[ext]',
            },
          } ],
        }, {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
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
      ...DEV ? { DEV: true } : {},
    }),

    new MiniCssExtractPlugin({
      filename: DEV ? '[name].css' : '[name].[hash].css',
      allChunks: true,
    }),

    ...pages.map((page) => new HtmlWebpackPlugin({

      template: PATHS.template, // required
      inject: false, // required
      appMountId: react ? 'react-root' : null,
      mobile: true,

      ...(!DEV ? {
        minify: {
          collapseWhitespace: true,
          preserveLineBreaks: true,
          minifyJS: true,
        },
        googleAnalytics,
      } : {}),

      ...page,
    })),
    
  ];

  if (!DEV) { // PRODUCTION CONFIG

    return {
      
      entry,

      output: {
        path: PATHS.dist,
        publicPath: `${basename}/`,
        filename: '[name].[chunkhash].js',
      },

      plugins: [

        new CleanWebpackPlugin([ 'dist' ]),

        ...sharedPlugins,
              
        new webpack.optimize.OccurrenceOrderPlugin(),

        new UglifyJsPlugin({
          parallel: true,
        }),

        new OptimizeCssAssetsPlugin({
          cssProcessorOptions: { discardComments: { removeAll: true } },
        }),
        
      ],

      ...baseConfig,
    };

  } else { // DEVELOPMENT CONFIG

    return {

      devtool: 'eval-source-map',

      output: {
        publicPath: '/',
        globalObject: 'this',
      },

      devServer: {
        hot: true,
        historyApiFallback: true,
        port: 8080,
        watchContentBase: true,
      },

      entry,

      plugins: [

        ...sharedPlugins,

        new webpack.NamedModulesPlugin(),

        new webpack.HotModuleReplacementPlugin(),
      ],
      
      ...baseConfig,
    };

  }
};

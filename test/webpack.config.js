module.exports = require('../index')({
  react: true,
  manifest: {
    display: 'standalone',
    background_color: '#FF0000',
  },
  offline: process.env.NODE_ENV === 'production',
  entry: {
    foo: './src/customEntryPoint',
    // TEMP: webpack-dev-server hot reload doesn't work with multiple entry points,
    // waiting for https://github.com/webpack/webpack-dev-server/pull/2920
    ...(process.env.NODE_ENV === 'development'
      ? {}
      : { bar: './src/anotherEntryPoint' }),
  },
  output: 'myBuildDirectory',
  devPort: 8000,
  url: 'https://example.com',
  pages: [
    {
      title: 'Test Page',
      favicon: './src/favicon.png',
      meta: {
        'theme-color': '#3367D6',
        description: 'This is a great website',
      },
      headElements: [{ tag: 'script', src: 'not_found.js' }],
      bodyElements: [{ tag: 'div', id: 'hidden_el' }],
    },
  ],
});

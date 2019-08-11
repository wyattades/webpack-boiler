module.exports = require('../index')({
  react: true,
  manifest: {
    background_color: '#FF0000',
  },
  entry: {
    foo: './src/customEntryPoint',
    bar: './src/anotherEntryPoint',
  },
  output: 'myBuildDirectory',
  devPort: 8000,
  url: 'https://example.com',
  pages: [{
    title: 'Test Page',
    favicon: './src/favicon.png',
    meta: {
      'theme-color': '#3367D6',
      description: 'This is a great website',
    },
    headElements: [{ tag: 'script', src: 'not_found.js' }],
  }],
});

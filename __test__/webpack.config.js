module.exports = require('../index')({
  react: true,
  pages: [{
    title: 'Test Page',
    meta: {
      'theme-color': '#3367D6'
    },
    manifest: {
      background_color: '#FF0000',
    },
    headElements: [{ tag: 'script', src: 'not_found.js' }],
  }],
});

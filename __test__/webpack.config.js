module.exports = require('../index')({
  react: true,
  manifest: {
    start_url: 'https://localhost:8080',
    background_color: '#FF0000',
  },
  pages: [{
    title: 'Test Page',
    meta: {
      'theme-color': '#3367D6'
    },
    headElements: [{ tag: 'script', src: 'not_found.js' }],
  }],
});

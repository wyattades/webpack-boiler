module.exports = {
  server: {
    command:
      process.env.NODE_ENV === 'production'
        ? 'http-server -p 3033 myBuildDirectory'
        : 'webpack-dev-server --port 3033',
    port: 3033,
    options: {
      cwd: './test',
    },
  },
};

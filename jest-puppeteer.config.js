const PORT = 3033;

module.exports = {
  launch: {
    headless: !process.env.DISABLE_HEADLESS,
  },
  server: {
    command:
      process.env.NODE_ENV === 'production'
        ? `http-server -p ${PORT} myBuildDirectory`
        : `webpack-dev-server --port ${PORT}`,
    port: PORT,
    options: {
      cwd: './test',
    },
  },
};

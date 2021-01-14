const PORT = 3033;

module.exports = {
  launch: {
    headless: !process.env.DISABLE_HEADLESS,
  },
  server: {
    command:
      process.env.JEST_SERVER_NODE_ENV === 'production'
        ? `NODE_ENV=production http-server -p ${PORT} myBuildDirectory`
        : `NODE_ENV=development webpack serve --port ${PORT}`,
    port: PORT,
    options: {
      cwd: './test',
    },
  },
};

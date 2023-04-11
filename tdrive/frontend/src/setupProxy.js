const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/internal',
    createProxyMiddleware({
      target: 'http://localhost:4000',
    }),
  );
  app.use(
    '/__',
    createProxyMiddleware({
      target: 'http://localhost:4000',
    }),
  );
};

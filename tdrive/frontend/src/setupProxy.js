const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/internal',
    createProxyMiddleware({
      target: 'http://localhost:4000',
      onError: (err, req, resp) => {
        console.log(err);
      },
    }),
  );
  app.use(
    '/__',
    createProxyMiddleware({
      target: 'http://localhost:4000',
    }),
  );
};

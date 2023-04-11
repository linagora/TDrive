var connect = require('connect');
var serveStatic = require('serve-static');
connect()
  .use(serveStatic(__dirname + '/../public/'), {
    fallthrough: true,
  })
  .use((req, res, next) => {
    req.path = req.url = '/index.html';
    serveStatic(__dirname + '/../public/')(req, res, next);
  })
  .listen(8080, function() {
    console.log('Server running on 8080...');
  });

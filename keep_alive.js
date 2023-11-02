var http = require('http');

http.createServer(function (req, res) {
  res.write("Sistema inicializado com sucesso.");
  res.end();
}).listen(8080);
/*
 * Simple file-service web application.
 * We use this for simpler UI testing when working on the coding activities.
 */

var fs = require('fs');
var http = require('http');

http.createServer(function(request, response) {
console.log(request.method + " " + request.url);
    var filename = request.url.substring(1);
    var contentType = filename.endsWith(".html")
      ? "text/html" : (filename.endsWith(".css")
        ? "text/css" : (filename.endsWith(".js")
          ? "application/javascript" : "text/plain"));

    fs.readFile(filename, function(contentType, err, data) {
        if (data != null) {
          response.writeHead(200, {"Content-Type": contentType});
          response.end(data);
        } else {
          response.writeHead(404);
          response.end();
        }
      }.bind(filename, contentType));
  }).listen(8080);


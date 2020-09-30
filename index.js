/*
 * Primary file for the API
 *
*/

// Dependencies
var http = require('http');

// The Server should respond to all requests with a string
var server = http.createServer(function(req, res) {
    res.end('Hello World!');
});

// Start the server, and have it listen on port 3000
server.listen(3000, function() {
    console.log('The server is listerning on port 3000 now');
});

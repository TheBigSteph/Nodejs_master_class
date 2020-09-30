/*
 * Primary file for the API
 *
*/

// Dependencies
var http = require('http');
var url = require('url');

// The Server should respond to all requests with a string
var server = http.createServer(function(req, res) {
    // Get Url and parse it
    var parseUrl = url.parse(req.url, true);

    // Get path
    var path = parseUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    var queryStringObject = parseUrl.query;

    // Get HTTP Method
    var method = req.method.toLowerCase();

    // Send the response
    res.end('Hello World!\n');

    // Log the request path
    console.log('Request received on path: '+trimmedPath+ ' with this method '+method+ 'and with these query string parameters', queryStringObject);

});

// Start the server, and have it listen on port 3000
server.listen(3000, function() {
    console.log('The server is listerning on port 3000 now');
});

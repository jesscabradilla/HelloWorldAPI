//
// Primary file for the API
//
'use strict';

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;


// The server should respond to all requests with a string
const server = http.createServer(function(req,res) {

    // Get the url and parse it
    const parsedUrl = url.parse(req.url,true);

    // Ge the path
    const path = parsedUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the query string as an object
    const queryStringObject = parsedUrl.query;

    // Get the headers as an object
    const headers = req.headers;

    // Get the http method from the request
    const method = req.method.toLowerCase();

    // Get payload if any
    const decoder = new StringDecoder('utf-8');
    let buffer = '';
    req.on('data', function(data) {
        buffer += decoder.write(data);
    });
    req.on('end', function(){
        buffer += decoder.end();

        // Chose the handler this request should go to. If one is  not found use the notFound handler
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' && method.toLowerCase() === 'post' ? router[trimmedPath] : handlers.notFound;


        const data = {
            'trimmedPath': trimmedPath,
            'querySTringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function(statusCode, payload){
            // Use the status code called back by the handler or default to 200
            statusCode = typeof(statusCode) === 'number' ? statusCode : 200;

            // Use the payload called back by the handler or default to an empty object
            payload = typeof(payload) === 'object' ? payload : {};

            // Convert an object to string
            const payloadString = JSON.stringify(payload);

            // Return the response
            // Set content type
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            // Return the payload
            res.end(payloadString);

            // Log the request
            console.log('\n\n Request Received on Path: ' + trimmedPath +  
            `\n\n Method: ${method.toUpperCase()}` + 
            `\n\n Query String Parameters: ${JSON.stringify(queryStringObject)}` +
            `\n\n Headers: \n\n ${JSON.stringify(headers)}` + 
            `\n\n\n Payload: \n ${buffer}` +
            `\n\n\n Response - \n StatusCode: ${statusCode} \n Payload: ${payloadString}`
            );

        })
        
        });
    
});

// Start the server, and have it listen to port 3000
server.listen(3000,function(){
    console.log("The server is listening on port 3000 now");
});

// Define handlers
const handlers = {}

handlers.hello = function(data,callback){
    // Callback a http status code, and message in JSON format
    callback(200,{'message' : 'Hi! and welcome :)'});
};

handlers.notFound = function(data,callback){
    callback(404);
};

const router = {
    'hello': handlers.hello,
}

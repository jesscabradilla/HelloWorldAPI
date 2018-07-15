
'use strict'

// Dependencies
var http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

 // Instantiate the HTTP server
 var httpServer = http.createServer(function(req,res){
    unifiedServer(req,res);
  });
  
  // Start the HTTP server
  httpServer.listen(config.httpPort,function(){
    console.log('The HTTP server is running on port '+config.httpPort);
  });
  
  // Instantiate the HTTPS server
  var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
  };
  var httpsServer = https.createServer(httpsServerOptions,function(req,res){
    unifiedServer(req,res);
  });
  
  // Start the HTTPS server
  httpsServer.listen(config.httpsPort,function(){
   console.log('The HTTPS server is running on port '+config.httpsPort);
  });


// All the server logic for both the http and https server
const unifiedServer = function(req,res){

        // Get the URL and parse it
        const parsedURL = url.parse(req.url,true);

        // Get the path
        const path = parsedURL.pathname;
        const trimmedPath = path.replace(/^\/+|\/+$/g,'');
    
        // Get the query string as an object
        const queryStringObject = parsedURL.query;
    
        // Get the HTTP Method
        const method = req.method.toLowerCase();
    
        // Get the headers as an object
        const headers = req.headers;
    
        // Get the payload, if there is any
        const decoder = new StringDecoder('utf-8');
        let buffer = '';
    
        req.on('data', function(data){
            buffer += decoder.write(data);
        });
    
        req.on('end',function(){
            buffer += decoder.end();
    
        // Chose the handler this request should go to.
        // If none was found use the notFound handler.
        const chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    
        // Construct the data object to send to the handler
        const data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': buffer
        };
    
        // Route the request to the handler specified in the router
        chosenHandler(data,function(statusCode,payload){
            // Use the status code called back by the handler,
            // or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
    
            // Use the payload called back by the handler, or default to and empty object
            payload = typeof(payload) == 'object' ? payload : {};
    
            // Convert the payload to a string
            const payloadString = JSON.stringify(payload);
    
            // Return the response
            res.setHeader('Content-Type','application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
    
            // Log the request path
            console.log('Returning this response: ', statusCode,payloadString);
        });
    
      });
};


// Define handlers
let handlers = {};


// Hello handler
handlers.hello = function(data, callback){
    // Callback a status code 200, and a response in JSON format.
    callback(200,{'reply': 'Hi!!!'});
};

// Not found handler
handlers.notFound = function(data, callback){
    callback(404);
}

// Define a request router
const router = {
    'hello': handlers.hello
};


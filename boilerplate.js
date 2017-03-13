// Including and starting dependencies
var app           = require("express").express()
  , bodyParser    = require('body-parser')
  , server        = require('http').createServer(app).listen(5446)
  , jwt           = require('jsonwebtoken') // used to create, sign, and verify tokens 
  , r             = require('rethinkdb')

/***********************************
      GLOBAL VARIABLES & FUNCTIONS
************************************/
host    = {
  , address:  'localhost'
  , database: 'Boilerplate'
}
activeTokens    = {}; // Allow to have a better control on what are the "active sessions"
tokenPassphrase = process.env.tokenPassphrase || "keyboard cat"; // secret variable 👀

// Middleware to ensure that token is valid
// Its in a variable in order be used as a global function
// so it doesn't need to be redeclared in every modules
isTokenValid = function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // if there is no token, return an error
  if (!token) return res.status(403).send({ message: 'No token provided.'});

  // verify the token & decode it
  jwt.verify(token, tokenPassphrase, function(err, decoded) {  
    var tokenExist = false; // Default value to false for the condition
    if (err || activeTokens[decoded["username"]] === undefined) return res.status(403).send({ message: 'Failed to authenticate token.' });

    // Going through every active user tokens
    for(var k in activeTokens[decoded["username"]]) {
      if(activeTokens[decoded["username"]][k].token != token) continue;
      activeTokens[decoded["username"]][k].lastAccessed = new Date(); // We update the last accessed value with actual date
      tokenExist = true // If the token is found, then we turn this variable to true
    }

    // If tokenExist is still on false, then we return that the auth failed.
    if(!tokenExist) return res.status(403).send({ message: 'Failed to authenticate token.' });
    
    // storing it in the request
    req.token = {
      token: token,
      decoded: decoded
    }

    next();
  });
}

/*****************************
      INITIALIZATION
*****************************/

app.use(bodyParser.json({limit: '2mb'}));                       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true,limit: '2mb'}));  // to support URL-encoded bodies
app.use(function(req,res,next){
    // CORS INSTRUCTIONS 🔐
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
});

console.log("######################################");
console.log("# NodeJS Boilerplate");
console.log("# By @cyberwarfighte1 (Samuel LESPES CARDILLO)");
console.log("######################################");
console.log("[I] Express server started on port 5446 ...");

// ======================= START EXPRESS.JS ============================ //
require('./routes_controller').initializeRouting(app, function(callback) {
  console.log(callback);
});

// the book of connections 
    // davar = word & meaning 

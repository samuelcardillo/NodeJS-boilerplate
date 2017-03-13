// Including and starting dependencies
var express       = require("express")
  , app           = express()
  , bodyParser    = require('body-parser')
  , server        = require('http').createServer(app).listen(5446)

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
require('./core/database')
require('./core/security')
require('./core/routes').initializeRouting(app, function(callback) {
  console.log(callback);
});

// the book of connections 
// davar = word & meaning 

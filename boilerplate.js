// Initializing dependencies
var express       = require("express")
  , app           = express()
  , bodyParser    = require('body-parser')
  , program       = require('commander')
                      .version('0.0.1')
                      .option('-p, --port [value]', 'port')
                      .option('-d, --db [value]',   'dbname')
                      .parse(process.argv)
  , server        = {
    port:       program.port    || 5446,
    database:   program.db      || "boilerplate",
    instance:   require('http').createServer(app),
    security:   require('./core/security')
  }
  server.instance.listen(server.port);

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
console.log("[I] Express server started on port " + server.port + " ...");

// ======================= START EXPRESS.JS ============================ //

try {
  require('./core/database').initialize(server);
  require('./core/routes').initialize(app, function(callback) {
    console.log(callback);
  });
} catch(err) {
  // If there is a crash, we can do some processing before closing the server.
  console.log(err);
  server.instance.close();
}

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    server.security.saveTokens(function(callback){
      process.exit();
    });
});

// the book of connections 
// davar = word & meaning 

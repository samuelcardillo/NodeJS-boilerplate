var r           = require('rethinkdb')
  , async       = require("async")
  , exports     = module.exports = {};

// Global variable that can be reused in routing
database = {
  name:      undefined,
  hostname: "localhost"
}

exports.initialize = function(server) {
  database.name = server.database; // We update the global variable with the name the user chosen

  // We define the tables that are required by the boilerplate
  var tables = [
    "users"
  ];

  // We check if the database exist
  onConnect(function(err, conn) {
    r.dbList().run(conn, function(err, results){
      // If the database exist, we have nothing to do
      if(results.indexOf(database.name) != -1) {
        conn.close(); // We close the connection
        server.security.loadTokens(); // We load the tokens if any exists
        return console.log("[I] Database initialized with success"); // And we abort any additional procedures
      }

      console.log("[O] I have not found " + database.name + "! 😱  Let me fix that for you...")
      // Else, we create the database and its tables
      r.dbCreate(database.name).run(conn, function(err, result){
        console.log("[I] Database " + database.name + " was created with success");

        // We create the tables asynchronously 
        async.each(tables, function(item, callback){
          r.db(database.name).tableCreate(item).run(conn, function(err, result){
            console.log("[I] Table " + item + " was created with success");
            return callback();
          });
        }, function(err) {
          conn.close(); // We close the connection at the end
          console.log("[I] All good! Everything is ready for you 😘");
          console.log("[I] Database initialized with success");
          return; // Yay
        });

      })
    })
  })
}

onConnect = function(callback) {
  r.connect({host: database.hostname, port: 28015 }, function(err, connection) {
    if(err) throw err;
    callback(err, connection);
  });
}


// the book of connections 
// davar = word & meaning 

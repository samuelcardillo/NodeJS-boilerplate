var r           = require('rethinkdb')
  , async       = require("async")
  , exports     = module.exports = {};

// Global variable that can be reused in routing
database = {
  name:      undefined,
  hostname: "localhost"
}

exports.initialize = function(databaseName) {
  database.name = databaseName; // We update the global variable with the name the user chosen

  // We define the tables that are required by the boilerplate
  var tables = [
    "users",
    "users_token"
  ];

  // We check if the database exist
  onConnect(function(err, conn) {
    r.dbList().run(conn, function(err, results){
      // If the database exist, we have nothing to do
      if(results.indexOf(databaseName) != -1) {
        conn.close(); // We close the connection
        return console.log("[I] Database initialized with success"); // And we abort any additional procedures
      }

      console.log("[O] I have not found " + databaseName + "! 😱  Let me fix that for you...")
      // Else, we create the database and its tables
      r.dbCreate(databaseName).run(conn, function(err, result){
        console.log("[I] Database " + databaseName + " was created with success");

        // We create the tables asynchronously 
        async.each(tables, function(item, callback){
          r.db(databaseName).tableCreate(item).run(conn, function(err, result){
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

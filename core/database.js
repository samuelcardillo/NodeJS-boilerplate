var r = require('rethinkdb');

host    = {
  address:  'localhost',
  database: 'Boilerplate'
}

onConnect = function(callback) {
  r.connect({host: host.address, port: 28015 }, function(err, connection) {
    if(err) throw err;
    callback(err, connection);
  });
}


// the book of connections 
// davar = word & meaning 

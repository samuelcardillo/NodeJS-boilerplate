var exports     = module.exports = {};

// Initialize the routing
exports.initialize = function(app, callback) {
  try {
    app.use('/api/auth'     , require('../routes/auth'));

    return callback("[I] Routes initialized with success");
  } catch(e) {
    return callback(e);
  }
  
}

// the book of connections 
// davar = word & meaning 

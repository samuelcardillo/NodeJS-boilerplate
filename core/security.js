var crypto  = require('crypto')
  , r       = require('rethinkdb')
  , jwt     = require('jsonwebtoken')
  , exports = module.exports = {};

activeTokens    = {}; // Allow to have a better control on what are the "active sessions"

// Secret variables 👀
var securityDetails = {
  specialSalt     : process.env.specialSalt || "SuperSecretKey",
  tokenPassphrase : process.env.tokenPassphrase || "keyboard cat"
}

// Middleware to ensure that token is valid
// Its in a variable in order be used as a global function
// so it doesn't need to be redeclared in every modules
isTokenValid = function(req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // if there is no token, return an error
  if (!token) return res.status(403).send({ message: 'No token provided.'});

  // verify the token & decode it
  jwt.verify(token, securityDetails.tokenPassphrase, function(err, decoded) {  
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

exports.generateToken = function(requestDetails, userDetails, callback) {
  var error = false; 
  var generatedToken = jwt.sign(userDetails, securityDetails.tokenPassphrase, { expiresIn: '1d' }); // We generate the token
  
  if(activeTokens[requestDetails.body.email] === undefined) activeTokens[requestDetails.body.email] = [];

  // We add the token in the user details
  userDetails.token = generatedToken;

  // We store the token in the active tokens and few info for security
  activeTokens[requestDetails.body.email].push({
    token         :   userDetails.token,
    userAgent     :   requestDetails.headers["user-agent"],
    ipAddress     :   requestDetails.headers["x-forward-for"],
    createdOn     :   new Date(),
    lastAccessed  :   new Date()
  })

  return callback(error, userDetails);
}

exports.loadTokens = function() {
  onConnect(function(err, conn) {
    r.db(database.name).table('users_token').run(conn, function(err, cursor){
      cursor.toArray(function(err, results){
        conn.close();
        activeTokens = results;
        console.dir(activeTokens);
        console.log(results.length + " tokens loaded!");
      })
    })
  })
}

exports.saveTokens = function(callback) {
  onConnect(function(err, conn) {
    r.db(database.name).table('users_token').delete().run(conn, function(err, result) {
      console.dir(activeTokens);
      r.db(database.name).table('users_token').insert(activeTokens).run(conn, function(err, result){
        console.dir(err);
        console.dir(result);
        conn.close();
        console.log("[I] The tokens list has been saved!");
        return callback(true);
      })
    }) 
  })
}


// Hash the password using SHA256 algorithm /w a salt 🔐
exports.hashPassword = function(password) {
  return crypto.createHmac("sha256", securityDetails.specialSalt).update(password).digest('hex');
}


// the book of connections 
// davar = word & meaning 

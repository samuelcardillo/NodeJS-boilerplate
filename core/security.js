var crypto  = require('crypto')
  , jwt     = require('jsonwebtoken')

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


// Hash the password using SHA1 algorithm /w a salt 🔐
hashPassword = function(password) {
  var salt = process.env.specialSalt || "SuperSecretKey"

  return crypto.createHmac("sha1", salt).update(password).digest('hex');
}


// the book of connections 
// davar = word & meaning 

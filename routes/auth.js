var router    = require('express').Router()
  , jwt       = require('jsonwebtoken')
  , r         = require('rethinkdb')
  , crypto    = require('crypto')

/*****************************
      EXPORTS
*****************************/

router.post('/signup', function(req, res){
  onConnect(function(err, conn) {
    r.db(host.database).table('users').insert({
      email:    req.body.email,
      password: hashPassword(req.body.password)
    }).run(conn, function(err, result){
      conn.close();
      if(err) return res.status(403).send({message: 'Problem establishing a connection with the database.'});
      res.status(200).send({success: true});
    })
  })
});

// Sign in the user
router.post('/signin', function(req,res){

  if((req.body) === undefined || (req.body.password && req.body.email) === undefined) return res.status(403).send({message: 'Fields missing'});

   // Lookup in the database
  onConnect(function(err, conn) {
    r.db(host.database)
    .table('users')
    .filter(
      {
        email:    req.body.email,
        password: hashPassword(req.body.password)
      })
    .without('password')
    .run(conn, function(err, cursor) {
      conn.close(); // We don't need the connection anymore
      if(err) return res.status(403).send({message: 'Problem establishing a connection with the database.'});

      cursor.toArray(function(err, result) {
        if (err) return res.status(403).send({message: 'Problem establishing a connection with the database.'});
        if(result.length <= 0) return res.status(403).send({message: 'User doesn\'t exist'});

        if(activeTokens[req.body.username] === undefined) activeTokens[req.body.username] = [];
        // We generate the token
        result[0].token = jwt.sign(result[0], tokenPassphrase, { expiresIn: '1d' });

        // We store the token in the active tokens and few info for security
        activeTokens[req.body.username].push({
          token         :   result[0].token,
          userAgent     :   req.headers["user-agent"],
          ipAddress     :   req.headers["x-forward-for"],
          createdOn     :   new Date(),
          lastAccessed  :   new Date()
        })

        res.status(200).send(result);
      });
    })
  });

})

router.get('/logout', isTokenValid, function(req,res){
  if((activeTokens[req.token["decoded"]["username"]] || activeTokens[req.token["decoded"]["username"]][req.token["token"]]) === undefined) return res.status(403).send({success: false, message: 'Wrong token !'})

  // We filter the variables to get ride of the bad one
  activeTokens[req.token["decoded"]["username"]] = activeTokens[req.token["decoded"]["username"]].filter(function(value){
    return value.token != req.token["token"];
  })

  res.status(200).send(activeTokens[req.token["decoded"]["username"]]);
});

/*****************************
      FUNCTIONS
*****************************/
function onConnect(callback) {
  r.connect({host: host.address, port: 28015 }, function(err, connection) {
    if(err) throw err;
    callback(err, connection);
  });
}

// Hash the password using SHA1 algorithm /w a salt 🔐
function hashPassword(password) {
  var salt = process.env.specialSalt || "SuperSecretKey"

  return crypto.createHmac("sha1", salt).update(password).digest('hex');
}

module.exports = router;
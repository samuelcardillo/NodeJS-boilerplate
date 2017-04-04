var router    = require('express').Router()
  , jwt       = require('jsonwebtoken')
  , r         = require('rethinkdb')
  , security  = require('../core/security')

/*****************************
      EXPORTS
*****************************/

router.get('/', function(req, res) {
  console.dir(activeTokens);
  res.status(200).send("hey");
})

router.post('/signup', function(req, res){
  if((req.body.password && req.body.email) === undefined) return res.status(403).send({message: 'Fields missing'});

  req.body.password = security.hashPassword(req.body.password); // We hash the password

  // We send the whole body parameters which allows full customization
  onConnect(function(err, conn) {
    r.db(database.name).table('users').insert(req.body).run(conn, function(err, result){
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
    r.db(database.name)
    .table('users')
    .filter(
      {
        email:    req.body.email,
        password: security.hashPassword(req.body.password)
      })
    .without('password')
    .run(conn, function(err, cursor) {
      conn.close(); // We don't need the connection anymore
      if(err) return res.status(403).send({message: 'Problem establishing a connection with the database.'});

      cursor.toArray(function(err, results) {
        if (err) return res.status(403).send({message: 'Problem establishing a connection with the database.'});
        if(results.length <= 0) return res.status(403).send({message: 'User doesn\'t exist'});

        security.generateToken(req, results[0], function(err, result){
          res.status(200).send(result);
        });
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

module.exports = router;
# Nodejs Backend Boilerplate

This NodeJS boilerplate is my starting point on any of the web projects I am working on. I decided to open-source it and update it as it goes. 

It requires NodeJS (obviously) and RethinkDB as it is mainly what I use as database technology for my projects.

#### With what it comes

* CLI functionalities
* JWT management system (generation & verification)
* User management system (sign in, sign up, log out)
* Route layout

### With what it will come next

- The token system (which is multi-layered, by the way) is actually working "locally" which means that everytime the server restart, the tokens list is reinitialized. It is something I have fixed multiple times and I will apply the same fix here: tokens managed by the database (*not Redis*).

- Make all the `core/*` files cleaner. 

Additional ideas will be added with time... 

### How to use it?

In this version, this is how to use it: 
- `git clone` it
- `npm install` it
- `rethinkdb` it
- `node boilerplate.js` it

### Use the CLI functionalities

The boilerplate comes with a useful set of arguments that can be used when launching the server.

- `node boilerplate.js --port [port]` : change the port it listen too, default is 5446
- `node boilerplate.js --db [dbName]` : change the database it initiallity connect too, default is "*boilerplate*"

You can also mix them up `node boilerplate.js --port 5446 --db Github`

### Additional details
##### User password

The password is hashed with `SHA256` and add a salt defined by the environment variable `specialSalt`. If the environment variable is not defined, the default value of the salt will be *SuperSecretKey* and can be modified in `core/security.js`

##### JSON Web Token
The token is hashed with `HMAC SHA256` and add a verification signature defined by the environment variable `tokenPassphrase`. If the environment variable is not defined, the default value of the salt will be *keyboard cat* and can be modified in `core/security.js`
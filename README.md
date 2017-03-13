# Nodejs Backend Boilerplate

This NodeJS boilerplate is my starting point on any of the web projects I am working on. I decided to open-source it and update it as it goes. 

It requires NodeJS (obviously) and RethinkDB as it is mainly what I use as database technology for my projects.

#### With what it comes

* Token generation & verification system
* User sign in / sign up / logout
* Route layout

### With what it will come next

Usually I do everything manually when it comes to start a new project (beside copying & pasting my boilerplate): creating the database, the table, changing the name in the code, ... As it is now on GitHub, I want everything to be entierely automated in order to reduce to deployment time as much as possible. I have few ideas and next updates will mainly focus on this part. 

The token system (which is multi-layered, by the way) is also working "locally" : meaning that everytime the server restart, the tokens list is reinitialized. It is something I have fixed multiple times and I will apply the same fix here: tokens managed by the database.

Additional ideas will be added with time... 

### How to use it?

In this version, this is how to use it: 
- Git clone it
- `npm install` it
- `rethinkdb` it
- Change the database name in `core/database.js`
- `node boilerplate.js` it (*you can also `node boilerplate.js -p [port]` it to change the port it listen too, default is 5446*)

const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const Snippet = require('./models/snippet.js');
const Registrar = require('./models/registrar.js');
const session = require('express-session')
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/snippet');
const MongoClient = require('mongodb').MongoClient,
  assert = require('assert');
const ObjectId = require('mongodb').ObjectID;


let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use('/public', express.static(path.join(__dirname, '/public')));
app.engine('mustache', mustacheExpress());
app.set('views', './views');
app.set('view engine', 'mustache')

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))

passport.use(new LocalStrategy(
    function(username, password, done) {
        Registrar.authenticate(username, password, function(err, user) {
            if (err) {
                return done(err)
            }
            if (user) {
                return done(null, user)
            } else {
                return done(null, false, {
                    message: "There is no user with that username and password."
                })
            }
        })
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    Registrar.findById(id, function(err, user) {
        done(err, user);
    });
});

app.use(passport.initialize());
app.use(passport.session());

const requireLogin = function (req, res, next) {
  if (req.user) {
    next()
  } else {
    res.redirect('/login');
  }
}

app.get('/', function(req,res,next){
  res.render('home');
})

app.get('/register', function(req,res,next){
  res.render('register')
})

app.post('/register', function(req,res,next){
  const username = req.body.username;
  const password = req.body.password
  const user = new Registrar({
    username : username,
    password : password
  })
  user.save().then(function(){
    res.redirect('/login');
  })
})

app.get('/login', function(req,res,next){
  res.render('login')
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/display',
    failureRedirect: '/login',
}))

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/display', requireLogin, function(req, res, next) {
  Snippet.find().then(function(mySnippets) {
    res.render('snippetdisplayindex', {
      mySnippets:mySnippets,
      user: req.user
    })
  })
})
app.post('/display', function(req, res, next) {
  const title = req.body.title;
  const snip = req.body.snippet;
  const notes = req.body.notes;
  const language = req.body.language;
  let tagString = req.body.tags;
  const tags = tagString.split(' ');
  const snippet = new Snippet({
    title: title,
    snippet: snip,
    notes: notes,
    language: language,
    tags: tags
  })
  snippet.save()
    .then(function() {
      return Snippet.find();
    }).then(function(mySnippets) {
      res.render('snippetdisplayindex', {
        mySnippets: mySnippets,
        user: req.user
      })
    })
    .catch(function(error){
      console.log('error' + JSON.stringify(error));
      res.redirect('/')
    })


})

app.post('/search', function(req, res, next) {
  const searchTerm = req.body.searchTerm;
  Snippet.find({$or:[{tags: searchTerm},{language:searchTerm}]})
    .then(function(mySnippets) {
      console.log(mySnippets);
      res.render('search', {
        mySnippets: mySnippets
      })
    })
})

app.get('/:id', requireLogin, function(req, res, next) {
  let id = req.params.id;
  Snippet.findOne({
      _id: new ObjectId(id)
    })
    .then(function(mySnippets) {
      res.render('updateSnippet', {
        oneSnip:mySnippets
      })
    })
    .catch(function(error){
      console.log('error' + JSON.stringify(error));
      res.redirect('/')
    })
})

app.post('/:id', function(req, res, next) {
  const uptitle = req.body.title;
  const upsnip = req.body.snippet;
  const upnotes = req.body.notes;
  const uplanguage = req.body.language;
  let tagString = req.body.tags;
  const uptags = tagString.split(' ');
  let id = req.params.id;
  Snippet.updateOne({
      _id: new ObjectId(id)
    }, {
      title: uptitle,
      snippet: upsnip,
      notes: upnotes,
      language: uplanguage,
      tags: uptags
    })
    .then(function(mySnippets) {
      res.redirect('/display')
    })
    .catch(function(error){
      console.log('error' + JSON.stringify(error));
      res.redirect('/')
    })
})

app.post('/delete/:id', function(req,res,next){
  let id = req.params.id;
  Snippet.findOneAndRemove({
      _id: new ObjectId(id)
    })
    .then(function() {
      res.redirect('/');
    })
    .catch(function(error){
      console.log('error' + JSON.stringify(error));
      res.redirect('/')
    })

})
//
// app.get('/search', requireLogin function(req,res,next){
//   res.render('search');
// })



app.listen(3000, function() {
  console.log('successfully started Express Application');
})

process.on('SIGINT', function() {
  console.log("\nshutting down");
  mongoose.connection.close(function() {
    console.log('Mongoose default connection disconnected on app termination');
    process.exit(0);
  });
});

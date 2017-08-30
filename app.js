const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const Snippet = require('./models/snippet.js');
const Registrar = require('./models/registrar.js')
const mongoose = require('mongoose');
const path = require('path');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost:27017/snippet');
const MongoClient = require('mongodb').MongoClient,
  assert = require('assert');
const ObjectId = require('mongodb').ObjectID;


let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public',express.static(path.join(__dirname, '/public')));
  app.engine('mustache', mustacheExpress());
  app.set('views', './views');
  app.set('view engine', 'mustache')

app.get('/', function (req, res, next){
     res.render('snippetdisplayindex')
})
app.post('/', function (req,res,next){
  const title = req.body.title;
  const snip = req.body.snippet;
  const notes = req.body.notes;
  const language = req.body.language;
  let tagString = req.body.tags;
  const tags = tagString.split(' ');
  const snippet = new Snippet({title:title, snippet:snip, notes:notes, language:language, tags:tags})
  snippet.save()
  .then( function(){
    return Snippet.find();
  }).then(function(mySnippets){
    res.render('snippetdisplayindex',{mySnippets:mySnippets})
  })


})
app.get('/:id', function (req,res,next){
  let id = req.params.id;
  Snippet.findOne({_id:new ObjectId()})
  .then(function(snip){
    res.render('updateSnippet', {onesnip:snip})
  })
})

app.post('/:id', function(req,res,next){
  const uptitle = req.body.title;
  const upsnip = req.body.snippet;
  const upnotes = req.body.notes;
  const uplanguage = req.body.language;
  let tagString = req.body.tags;
  const uptags = tagString.split(' ');
  Snippet.updateOne(_id: new ObjectId(id)},{title:uptitle, snippet:upsnip, notes:upnotes, language:uplanguage, tags:uptags})
  .then(function(){
    return Snippet.find();
  }).then(function(mySnippets){
    res.render('snippetdisplayindex',{mySnippets:mySnippets})
  })
})

app.listen(3000, function() {
    console.log('successfully started Express Application');
  })

  process.on('SIGINT', function() {
    console.log("\nshutting down");
    mongoose.connection.close(function () {
      console.log('Mongoose default connection disconnected on app termination');
      process.exit(0);
    });
  });
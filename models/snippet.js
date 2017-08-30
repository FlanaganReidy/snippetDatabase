const mongoose = require('mongoose')

const snippetSchema = new mongoose.Schema({
  title: {type: String, required: true, unique: true},
  snippet: {type: String, required:true},
  notes:String,
  language: String,
  tags: [String]
})

const Snip = mongoose.model('Snip', snippetSchema)

module.exports = Snip;

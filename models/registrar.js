const mongoose = require('mongoose')

const registrarSchema = new mongoose.Schema({
  username:{type:String, required:true, unique:true},
  password:{type:String, required:true}
})

newUser = mongoose.model('newUser',registrarSchema);

module.exports = newUser;

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const registrarSchema = new mongoose.Schema({
  username:{type:String, required:true, lowercase:true, unique:true},
  passwordHash:{type:String, required:true}
})

registrarSchema.virtual('password')
  .get(function () { return null })
  .set(function (value) {
    const hash = bcrypt.hashSync(value, 8);
    this.passwordHash = hash;
  })

registrarSchema.methods.authenticate = function (password) {
  return bcrypt.compareSync(password, this.passwordHash);
}

registrarSchema.statics.authenticate = function(username, password, done) {
    this.findOne({
        username: username
    }, function(err, user) {
        if (err) {
            done(err, false)
        } else if (user && user.authenticate(password)) {
            done(null, user)
        } else {
            done(null, false)
        }
    })
};

const User = mongoose.model('User',registrarSchema);

module.exports = User;

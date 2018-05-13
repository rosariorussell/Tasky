const mongoose = require('mongoose')
const validator = require('validator')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcryptjs')

// create the schema before creating the model
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

// override default method and remove password and other sensitive information before sending back response
UserSchema.methods.toJSON = function(){
  var user = this
  var userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email'])
}

// add method to instance of User
UserSchema.methods.generateAuthToken = function() {
  var user = this
  var access = 'auth'
  var token = jwt.sign({_id: user._id.toHexString(), access}, '123456').toString()

  user.tokens = user.tokens.concat([{access, token}])

  return user.save().then(() => {
    return token
  })
}

// add method to model
UserSchema.statics.findByToken = function (token) {
  var User = this
  var decoded;

  try {
    decoded = jwt.verify(token, '123456')
  } catch (e) {
    return Promise.reject()
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

// Perform functions before saving to the model
// Only hash password when password is being modified
UserSchema.pre('save', function(next) {
  var user = this

  if (user.isModified('password')){
    bcrypt.genSalt(10, (err,salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash
        next()
      })
    })
  } else {
    next()
  }
})

// create the model from the schema
var User = mongoose.model('User', UserSchema)

module.exports = {User}

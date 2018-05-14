// Module dependencies
const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')

// Model dependencies
var {mongoose} = require('./../config/mongoose')
var {Task} = require('./../models/task')
var {User} = require('./../models/user')
var {authenticate} = require('./authenticate')

var router = express.Router();

router.post('/tasks', authenticate, (req, res) => {
  var task = new Task({
    text: req.body.text,
    _creator: req.user._id
  })

  task.save().then((doc) => {
    res.send(doc)
  }, (e) => {
    res.status(400).send(e)
  })
})

router.get('/tasks', authenticate, (req, res) => {
  Task.find({
    _creator: req.user._id
  }).then((tasks) => {
    res.send({tasks})
  }, (e) => {
    res.status(400).send(e)
  })
})

router.get('/tasks/:id', authenticate, (req, res) => {
  var id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Task.findOne({
    _id: id,
    _creator: req.user._id
  }).then((task) => {
    if (!task) {
      return res.status(404).send()
    }

    res.send({task})
  }).catch((e) => {
    res.status(400).send()
  })
})

router.delete('/tasks/:id', authenticate, (req, res) => {
  var id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Task.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((task) => {
    if (!task) {
      return res.status(404).send()
    }

    res.send({task})
  }).catch((e) => {
    res.status(400).send()
  })
})

router.patch('/tasks/:id', authenticate,  (req, res) => {
  var id = req.params.id
  var body = _.pick(req.body, ['text', 'completed'])

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Task.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((task) => {
    if (!task) {
      return res.status(404).send()
    }

    res.send({task})
  }).catch((e) => {
    res.status(400).send()
  })
})

router.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password'])
  var user = new User(body)

  user.save().then(() => {
    return user.generateAuthToken()
  }).then((token) => {
    res.header('x-auth', token).send(user)
  }).catch((e) => {
    res.status(400).send(e)
  })
})

router.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

router.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password'])

  User.findByCredentials(body.email, body.password).then((user) => {
    user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user)
    })
  }).catch((e) => {
    res.status(400).send()
  })
})

router.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }), () => {
    res.status(400).send()
  }
})

module.exports = router;

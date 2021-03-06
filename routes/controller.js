// Module dependencies
const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectID } = require('mongodb')

// Model dependencies
var { mongoose } = require('./../config/mongoose')
var { Task } = require('./../models/task')
var { User } = require('./../models/user')
var { authenticate } = require('./authenticate')

var app = express()

// CORS is being used because Angular front end is deployed on a different heroku server
const cors = require('cors')
var corsOptions = {
  origin: 'https://oxytasky.herokuapp.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', "*")
  res.header('Access-Control-Allow-Methods', "GET, PUT, POST, DELETE, PATCH, OPTIONS")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-auth")
  next()
})


app.post('/tasks', cors(corsOptions), authenticate, (req, res) => {
  var task = new Task({
    title: req.body.title,
    _creator: req.user._id
  })
  if (req.body.text) {
    task.text = req.body.text
  }
  if (req.body.title) {
    task.title = req.body.title
  }
  if (req.body.dueDate) {
    task.dueDate = req.body.dueDate
  }

  task.save().then((doc) => {
    res.send(doc)
  }, (e) => {
    res.status(400).send(e)
  })
})

app.get('/tasks', cors(corsOptions), authenticate, (req, res) => {
  Task.find({
    _creator: req.user._id
  }).then((tasks) => {
    res.send({ tasks })
  }, (e) => {
    res.status(400).send(e)
  })
})

app.get('/tasks/:id', cors(corsOptions), authenticate, (req, res) => {
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

    res.send({ task })
  }).catch((e) => {
    res.status(400).send()
  })
})

app.delete('/tasks/:id', cors(corsOptions), authenticate, (req, res) => {
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

    res.send({ task })
  }).catch((e) => {
    res.status(400).send()
  })
})

app.patch('/tasks/:id', cors(corsOptions), authenticate, (req, res) => {
  var id = req.params.id
  var body = _.pick(req.body, ['title', 'text', 'tags', 'completed', 'dueDate'])


  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  if (body.completed) {
    body.completed = JSON.parse(body.completed)
  }
  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Task.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true }).then((task) => {
    if (!task) {
      return res.status(404).send()
    }

    res.send({ task })
  }).catch((e) => {
    res.status(400).send()
  })
})

app.post('/users', cors(corsOptions), (req, res) => {
  var body = _.pick(req.body, ['email', 'password'])
  var user = new User(body)

  user.save().then(() => {
    return user.generateAuthToken()
  }).then((token) => {
    res.header('x-auth', token).send({ user, token })
  }).catch((e) => {
    res.status(400).send(e)
  })
})

app.get('/users/me', cors(corsOptions), authenticate, (req, res) => {
  res.send(req.user)
})

app.post('/users/login', cors(corsOptions), (req, res) => {
  var body = _.pick(req.body, ['email', 'password'])

  User.findByCredentials(body.email, body.password).then((user) => {
    user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send({ user, token })
    })
  }).catch((e) => {
    res.status(400).send()
  })
})

app.delete('/users/me/token', cors(corsOptions), authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }), () => {
    res.status(400).send()
  }
})

module.exports = app;

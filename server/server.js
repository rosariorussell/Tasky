var express = require('express')
var bodyParser = require('body-parser')
var {ObjectID} = require('mongodb')

var {mongoose} = require('./db/mongoose')
var {Task} = require('./models/task')
var {User} = require('./models/user')

var app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json())

app.post('/tasks', (req, res) => {
  var task = new Task({
    text: req.body.text
  })

  task.save().then((doc) => {
    res.send(doc)
  }, (e) => {
    res.status(400).send(e)
  })
})

app.get('/tasks', (req, res) => {
  Task.find().then((tasks) => {
    res.send({tasks})
  }, (e) => {
    res.status(400).send(e)
  })
})

app.get('/tasks/:id', (req, res) => {
  var id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Task.findById(id).then((task) => {
    if (!task) {
      return res.status(404).send()
    }

    res.send({task})
  }).catch((e) => {
    res.status(400).send()
  })
})

app.delete('/tasks/:id', (req, res) => {
  var id = req.params.id

  if (!ObjectID.isValid(id)) {
    return res.status(404).send()
  }

  Task.findByIdAndRemove(id).then((task) => {
    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  }).catch((e) => {
    res.status(400).send()
  })
})

app.listen(port, () => {
  console.log(`Start on port ${port}`)
})

module.exports = {app}
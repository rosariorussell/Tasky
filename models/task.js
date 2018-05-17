var mongoose = require('mongoose')

var Task = mongoose.model('Task', {
  title: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  text: {
    type: String,
    default: null,
    trim: true
  },
  tags: {
    type: String,
    default: null,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  _creator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
})

module.exports = { Task }
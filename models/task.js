var mongoose = require('mongoose')
var timestamps = require('mongoose-timestamp');


var TaskSchema = new mongoose.Schema({
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
});

TaskSchema.plugin(timestamps);
mongoose.model('Task', TaskSchema);
var Task = mongoose.model('Task', TaskSchema)

module.exports = { Task }
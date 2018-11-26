'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TaskSchema = new Schema({
  name: { // first column
    type: String,
    required: 'Kindly enter task name'
  },
  Created_date: { // second column
    type: Date,
    default: Date.now
  },
  status: { // third column
    type: [{
      type: String,
      enum: ['pending', 'ongoing', 'completed']
    }],
    default: ['pending']
  }
})

module.exports = mongoose.model('Tasks', TaskSchema)

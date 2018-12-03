'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MapSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Map', MapSchema)

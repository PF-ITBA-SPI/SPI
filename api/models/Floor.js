'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FloorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  overlay: {
    type: String,
    required: true,
  },
  coordinates: {
    type: {
      north: { type: Number, required: true },
      south: { type: Number, required: true },
      east: { type: Number, required: true },
      west: { type: Number, required: true },
    },
    required: true,
  },
})

module.exports = mongoose.model('Floor', FloorSchema)

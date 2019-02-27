'use strict'
const mongoose = require('mongoose')

const FloorSchema = new mongoose.Schema({
  // Displayed name. E.g: "1", "PB", "E", "-2"
  name: {
    type: String,
    required: true,
  },
  // Order number. Not to be confused with name. Example names: ["-1", "PB", "1", "E", "2"]. Order numbers: [0, 1, 2, 3, 4]
  number: {
    type: Number,
    required: true,
  },
  // Camera settings for the floor
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  zoom: {
    type: Number,
    required: false,
    default: 18
  },
})

module.exports = FloorSchema

'use strict'
const mongoose = require('mongoose')
const Overlay = require('./OverlaySchema')

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
  overlay: {
    type: Overlay,
    required: true
  },
})

module.exports = FloorSchema

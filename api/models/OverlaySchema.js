'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OverlaySchema = new Schema({
  url: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  // Width in meters
  width: {
    type: Number,
    required: true,
  },
  bearing: {
    type: Number,
    required: true,
  },
  anchor_x: {
    type: Number,
    required: true,
  },
  anchor_y: {
    type: Number,
    required: true,
  },
})

module.exports = OverlaySchema

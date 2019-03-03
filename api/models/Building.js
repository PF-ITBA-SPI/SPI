'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Floor = require('./FloorSchema')

const BuildingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  floors: {
    type: [Floor],
    required: true,
    default: [],
  },
  /**
   * Default floor to be loaded when selecting building. If not present, use `floors[0]`.
   */
  defaultFloorId: {
    type: String,
    required: false,
  },
  // Camera settings when selecting the building
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

module.exports = mongoose.model('Building', BuildingSchema)

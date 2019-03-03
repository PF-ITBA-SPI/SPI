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
    type: Floor,
    required: false,
  }
})

module.exports = mongoose.model('Building', BuildingSchema)

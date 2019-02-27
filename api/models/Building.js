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
})

module.exports = mongoose.model('Building', BuildingSchema)

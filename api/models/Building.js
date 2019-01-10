'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BuildingSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  floors: {
    // Floor ids
    type: [{ type: Schema.Types.ObjectId, ref: 'floor' }],
    default: [],
  },
})

module.exports = mongoose.model('Map', BuildingSchema)

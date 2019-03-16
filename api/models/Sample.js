'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const SampleSchema = new Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  buildingId: {
    type: ObjectId,
    required: true
  },
  floorId: {
    type: ObjectId,
    required: true
  },
  fingerprint: {
    type: Map,
    // Keys are always strings (access point BSSIDs), values are numbers (RSSIDs)
    of: Number,
    required: true
  },
})

module.exports = mongoose.model('Sample', SampleSchema)

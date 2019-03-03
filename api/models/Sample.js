'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const Fingerprint = require('./FingerprintSchema')

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
    type: Fingerprint,
    required: true
  }
})

module.exports = mongoose.model('Sample', SampleSchema)

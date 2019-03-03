'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema
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
    type: String,
    required: true
  },
  floorId: {
    type: String,
    required: true
  },
  fingerprint: {
    type: [Fingerprint],
    required: true
  }
})

module.exports = mongoose.model('Sample', SampleSchema)

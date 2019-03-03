'use strict'
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FingerprintSchema = new Schema({
  type: Map,
  // Keys are always strings (access point BSSIDs), values are numbers (RSSIDs)
  of: Number,
})

module.exports = FingerprintSchema

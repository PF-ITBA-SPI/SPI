'use strict'

const mongoose = require('mongoose')
require('../models/Sample') // Register model
const Sample = mongoose.model('Sample')

const DEFAULT_RSSI = 0
const K1 = 10
const K2 = 10

module.exports = {
  getLocations: async (req, res) => {
    const buildingId = req.body._id
    const query = Sample.find({ buildingId: buildingId })
    query.lean()

    try {
      const samples = await query.exec()

      if (samples === null) {
        return res.status(404).json({})
      }

      // Do algorithm
      const mainFingerprintSortedSSIDs = sortSSIDs(req.body.fingerprint)
      samples.forEach((sample) => {
        sample.sortedIds = sortSSIDs(sample.fingerprint)
      })

      // Calculate the floor:

      // Strep 1: We don't need it now because we are now receiving the building in the params. But // TODO change this to calculate building
      // Build R’, a subset of R, with all the samples where the building is b (the building estimated in the previous step)

      // Strep 2:
      // Build R’’, a subset of R’, with all the samples where the strongest AP is equal to AP0, AP1 or AP2
      const strongestSSIDs = mainFingerprintSortedSSIDs.slice(0, 3)
      var R2 = []
      samples.forEach((sample) => {
        if (samples.sortedIds[0] in strongestSSIDs) R2.push(sample)
      })

      // Step 3: TODO we are not doing this so we take it as if #(R'') is always big enough
      // If #(R’’) < n, then R’’ = R’, where #(.) denotes the cardinality of a set, and n is a parameter.

      // Step 4:
      // Compute the similarity, S(), between the fingerprint given and all the fingerprints in R’’.
      // The similarity function S() is the Manhattan distance

      R2.forEach((sample) => {
        sample.similarity = manhattanDistance(sample.fingerprint, req.body.fingerprint)
      })

      // Step 5:
      // Take the k1 samples in R’’ that are the most similar to fp0. (The ones with the smaller similarity, TODO check this)

      R2.sort((sample1, sample2) => sample1.similarity - sample2.similarity)
      var mostSimilarSamples = R2.slice(0, K1)

      // Step 6:
      // Count the number of samples, from within the k1, associated to each floor, and set f to the most frequent floor (majority rule).
      var mostFrequentFloor = getMostFrequentFloor(mostSimilarSamples)

      // Calculate the position:

      // Step 1:
      // Build R’’’, a subset of R’’ (from the floor estimation procedure), with all the samples where the floor is f.

      var R3 = []
      R2.forEach((sample) => {
        if (samples.floorId === mostFrequentFloor) R3.push(sample)
      })

      // Step 2:
      // Compute the similarity, S(), between fp0 and all then fingerprints in R’’’.
      // But this was already done in floor step 4

      // Step 3:
      // Take the k2 samples in R’’’ that are the most similar to fp0.
      // The sorting is also already done in step 5 of floor selection TODO check if this is useless
      R3.sort((sample1, sample2) => sample1.similarity - sample2.similarity)
      mostSimilarSamples = R3.slice(0, K2)

      // Step 4:
      // Compute the estimated coordinates as the centroid of the k2 samples.
      var position = getCentroid(mostSimilarSamples)
      position.floorId = mostFrequentFloor
      position.buildingId = buildingId
      res.json(position)
    } catch (err) {
      res.status(400).json(err)
    }
  }
}

function getCentroid (samples) {
  var latitudeSum = 0
  var longitudeSum = 0
  samples.forEach((sample) => {
    latitudeSum += sample.latitude
    longitudeSum += sample.longitude
  })
  return { latitude: latitudeSum / samples.length, longitude: longitudeSum / samples.length }
}

function sortSSIDs (fingerprint) {
  var ids = Object.keys(fingerprint)
  ids.sort((SSID1, SSID2) => fingerprint[SSID1] - fingerprint[SSID2])
  return ids.reverse()
}

function getMostFrequentFloor (samples) { // TODO this can be done in a more efficient way
  var floorsCount = {}
  var mostFrequentFloor = ''
  var maxCount = 0
  for (let sample of samples) {
    if (floorsCount[sample.floorId]) {
      floorsCount[sample.floorId]++
    } else {
      floorsCount[sample.floorId] = 1
    }
    if (maxCount < floorsCount[sample.floorId]) {
      mostFrequentFloor = sample.floorId
      maxCount = floorsCount[sample.floorId]
    }
  }
  return mostFrequentFloor
}

function manhattanDistance (fingerprint1, fingerprint2) {
  var keysUnion = [...new Set([...Object.keys(fingerprint1), ...Object.keys(fingerprint2)])]
  var unionSize = keysUnion.length
  var intersectionSize = Object.keys(fingerprint1).length + Object.keys(fingerprint2).length - keysUnion.length
  var sumatorial = 0
  keysUnion.forEach((key) => {
    var RSSI1 = fingerprint1[key] || DEFAULT_RSSI // Check what happens if default RSSI is not 0 and if there are RSSI with 0 value
    var RSSI2 = fingerprint2[key] || DEFAULT_RSSI
    sumatorial += Math.abs(RSSI1 - RSSI2)
  })
  return sumatorial / unionSize - 2 * intersectionSize
}

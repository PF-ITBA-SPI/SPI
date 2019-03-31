'use strict'

const mongoose = require('mongoose')
require('../models/Sample') // Register model
const Sample = mongoose.model('Sample')

const DEFAULT_RSSI = 0
const k1 = 10

module.exports = {
  getLocations: async (req, res) => {
    const query = Sample.find({ buildingId: req.body._id })
    query.lean()

    try {
      const samples = await query.exec()

      if (samples === null) {
        return res.status(404).json({})
      }

      // Do algorithm
      const mainFingerprint = req.body.fingerprint
      const mainFingerprintSortedSSIDs = sortSSIDs(mainFingerprint)
      samples.forEach((sample) => {
        var ids = sortSSIDs(sample.fingerprint)
        ids.sort((sample1, sample2) => mainFingerprint[sample1] - mainFingerprint[sample2])
        sample.sortedIds = ids
      })
      const strongestSSIDs = [mainFingerprintSortedSSIDs[0], mainFingerprintSortedSSIDs[1], mainFingerprintSortedSSIDs[2]]

      // Calculate the floor:

      // Strep 1: We don't need it now because we are now receiving the building in the params. But // TODO change this to calculate building
      // Build R’, a subset of R, with all the samples where the building is b (the building estimated in the previous step)

      // Strep 2:
      // Build R’’, a subset of R’, with all the samples where the strongest AP is equal to AP0, AP1 or AP2
      var R2 = []
      samples.each((sample) => {
        if (samples.sortedIds[0] in strongestSSIDs) R2.push(sample)
      })

      // Step 3: TODO we are not doing this so we take it ass if #(R'') is always big enough
      // If #(R’’) < n, then R’’ = R’, where #(.) denotes the cardinality of a set, and n is a parameter.

      // Step 4:
      // Compute the similarity, S(), between the fingerprint given and all the fingerprints in R’’.
      // The similarity function S() is the Manhattan distance

      R2.each((sample) => {
        sample.similarity = manhattanDistance(sample.fingerprint, mainFingerprintSortedSSIDs)
      })

      // Step 5:
      // Take the k1 samples in R’’ that are the most similar to fp0. (The ones with the smaller similarity, TODO check this)

      R2.sort((sample1, sample2) => sample1.similarity - sample2.similarity)
      const mostSimilarSamples = R2.slice(0, k1)

      // Step 6:
      // Count the number of samples, from within the k1, associated to each floor, and set f to the most frequent floor (majority rule).
      var mostFrequentFloor = getMostFrequentFloor(mostSimilarSamples)

      res.json(mostFrequentFloor)
    } catch (err) {
      res.status(400).json(err)
    }
  }
}

function sortSSIDs (fingerprint) {
  var ids = Object.keys(fingerprint)
  ids.sort((a, b) => fingerprint[a] - fingerprint[b])
  return ids
}

function getMostFrequentFloor (samples) { // TODO this can be done in a more efficient way
  return samples.sort((sample1, sample2) =>
    samples.filter(sample => sample.floorId === sample1.floorId).length -
    samples.filter(sample => sample.floorId === sample2.floorId).length
  ).reverse().pop().floorId
}

function manhattanDistance (fingerprint1, fingerprint2) {
  var keysUnion = new Set([...Object.keys(fingerprint1), ...Object.keys(fingerprint2)])
  var unionSize = keysUnion.length
  var intersectionSize = fingerprint1.length + fingerprint2.length - keysUnion.length
  var sumatorial = 0
  keysUnion.each((key) => {
    var RSSI1 = fingerprint1[key] || DEFAULT_RSSI // Check what happens if default RSSI is not 0 and if there are RSSI with 0 value
    var RSSI2 = fingerprint2[key] || DEFAULT_RSSI
    sumatorial += Math.abs(RSSI1 - RSSI2)
  })
  return 1 / unionSize * sumatorial - 2 * intersectionSize
}

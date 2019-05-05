'use strict'

const mongoose = require('mongoose')
require('../models/Sample') // Register model
const Sample = mongoose.model('Sample')

const DEFAULT_RSSI = 0
const K1 = 10
const K2 = 10

module.exports = {
  getLocation: async (req, res) => {
    const query = Sample.find({})
    query.lean()

    try {
      const samples = await query.exec()

      if (samples === null) {
        return res.status(404)
      }

      // Do algorithm
      const mainFingerprintSortedSSIDsByRSSI = sortSSIDsByRSSI(req.body)
      samples.forEach(sample => {
        sample.sortedIdsByRSSI = sortSSIDsByRSSI(sample.fingerprint)
      })

      // Calculate the building:

      // Step 1: Take AP0, the strongest AP observed in fp0.
      // Step 2: Build R’, a subset of the radio map R, with all the samples where the strongest AP is AP0.
      // Step 3: If R’ is an empty set, repeat steps 1 and 2 for the 2nd, 3rd, ..., strongest AP in fp0.
      var R0
      for (let i = 0; i < mainFingerprintSortedSSIDsByRSSI.length; i++) {
        R0 = samples.filter(sample => (sample.sortedIdsByRSSI[0] === mainFingerprintSortedSSIDsByRSSI[i]))
        if (R0.length > 0) break
      }
      // Step 4: Count the number of samples in R’ associated to each building and set b to the most frequent building (majority rule).
      var mostFrequentBuilding = getMostFrequent(R0, 'buildingId')

      // Calculate the floor:

      // Strep 1: Build R’, a subset of R, with all the samples where the building is b (the building estimated in the previous step)
      let R1 = samples.filter(sample => sample.buildingId.equals(mostFrequentBuilding))
      // Strep 2: Build R’’, a subset of R’, with all the samples where the strongest AP is equal to AP0, AP1 or AP2
      let R2 = R1.filter(sample => mainFingerprintSortedSSIDsByRSSI.slice(0, 3).includes(sample.sortedIdsByRSSI[0]))
      // Step 3: TODO we are not doing this so we take it as if #(R'') is always big enough
      // If #(R’’) < n, then R’’ = R’, where #(.) denotes the cardinality of a set, and n is a parameter.

      // Step 4: Compute the similarity, the Manhattan distance, between the fingerprint given and all the fingerprints in R’’.
      R2.forEach(sample => { sample.similarity = manhattanDistance(sample.fingerprint, req.body) })
      // Step 5: Take the k1 samples in R’’ that are the most similar to fp0. (The ones with the smaller similarity, TODO check this)
      R2.sort((sample1, sample2) => sample1.similarity - sample2.similarity)
      var mostSimilarSamples = R2.slice(0, K1)
      // Step 6: Count the number of samples, from within the k1, associated to each floor, and set f to the most frequent floor (majority rule).
      var mostFrequentFloor = getMostFrequent(mostSimilarSamples, 'floorId')

      // Calculate the position:

      // Step 1: Build R’’’, a subset of R’’ (from the floor estimation procedure), with all the samples where the floor is f.
      let R3 = R2.filter(sample => sample.floorId.equals(mostFrequentFloor))
      // Step 2: Compute the similarity, S(), between fp0 and all then fingerprints in R’’’. But this was already done in floor step 4
      // Step 3:
      // Take the k2 samples in R’’’ that are the most similar to fp0.
      // The sorting is also already done in step 5 of floor selection TODO check if this is useless
      R3.sort((sample1, sample2) => sample1.similarity - sample2.similarity)
      mostSimilarSamples = R3.slice(0, K2)
      // Step 4: Compute the estimated coordinates as the centroid of the k2 samples.
      var position = getCentroid(mostSimilarSamples)
      position.floorId = mostFrequentFloor
      position.buildingId = mostFrequentBuilding
      res.json(position)
    } catch (err) {
      res.status(400).json(err)
    }
  }
}

function getCentroid (samples) {
  var latitudeSum = 0
  var longitudeSum = 0
  samples.forEach(sample => {
    latitudeSum += sample.latitude
    longitudeSum += sample.longitude
  })
  return { latitude: latitudeSum / samples.length, longitude: longitudeSum / samples.length }
}

/*
  Return the SSIDs of the fingerprint sorted by their RSSI value in the fingerprint, by biggest to smallest
 */
function sortSSIDsByRSSI (fingerprint) {
  return Object.keys(fingerprint).sort((SSID1, SSID2) => fingerprint[SSID2] - fingerprint[SSID1])
}

function getMostFrequent (samples, key) {
  var elementsCount = {}
  var mostFrequent = ''
  var maxCount = 0
  for (let sample of samples) {
    if (elementsCount[sample[key]]) {
      elementsCount[sample[key]]++
    } else {
      elementsCount[sample[key]] = 1
    }
    if (maxCount < elementsCount[sample[key]]) {
      mostFrequent = sample[key]
      maxCount = elementsCount[sample[key]]
    }
  }
  return mostFrequent
}

function manhattanDistance (fingerprint1, fingerprint2) {
  var keysUnion = [...new Set([...Object.keys(fingerprint1), ...Object.keys(fingerprint2)])]
  var unionSize = keysUnion.length
  var intersectionSize = Object.keys(fingerprint1).length + Object.keys(fingerprint2).length - keysUnion.length
  var sumatorial = 0
  keysUnion.forEach(key => {
    var RSSI1 = fingerprint1[key] || DEFAULT_RSSI // Check what happens if default RSSI is not 0 and if there are RSSI with 0 value
    var RSSI2 = fingerprint2[key] || DEFAULT_RSSI
    sumatorial += Math.abs(RSSI1 - RSSI2)
  })
  return sumatorial / unionSize - 2 * intersectionSize
}

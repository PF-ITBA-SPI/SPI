'use strict'

const mongoose = require('mongoose')
require('../models/Sample') // Register model
const Sample = mongoose.model('Sample')

const DEFAULT_RSSI = 0
const K1 = 10
const K2 = 10
const MIN_SAMPLES_FOR_POSITION = 3

module.exports = {
  getLocation: async (req, res) => {
    const query = Sample.find({})
    query.lean()

    try {
      const samples = await query.exec()

      if (samples === null) {
        return res.status(404)
      }
      res.json(calculateLocation(samples, req.body))
    } catch (err) {
      res.status(400).json(err)
    }
  },

  getLocationFilteringSample: async (req, res) => {
    const query = Sample.find({})
    query.lean()

    try {
      const samples = await query.exec()
      if (samples === null) {
        return res.status(404)
      }
      const filteredSampleId = req.params.sampleId
      const location = calculateLocationFilteringSample(samples, filteredSampleId)
      if (location === -1) {
        res.status(404).send('Sample not found')
      } else {
        res.json(location)
      }
    } catch (err) {
      res.status(400).json(err)
    }
  },

  getLocationError: async (req, res) => {
    const query = Sample.find({ fingerprint: { '$ne': {} } }) // With at least one fingerprint
    query.lean()
    try {
      const samples = await query.exec()
      // const samples = require('C:\\Users\\juan_\\Desktop\\samples.json')
      //   .filter(s => Object.entries(s.fingerprint).length > 0)
      //   .map(entry => {
      //     ['_id', 'buildingId', 'floorId'].forEach(key => {
      //       if (entry.hasOwnProperty(key)) {
      //         entry[key] = new mongoose.Types.ObjectId(entry[key]); // Convert to ObjectId
      //       }
      //     })
      //     return entry
      //   })
      if (samples === null) {
        return res.status(404)
      }
      console.debug(`Calculating error for ${samples.length} samples...`)
      const distances = {}
      samples.forEach((sample) => {
        const filteredSampleId = sample._id
        const location = calculateLocationFilteringSample(samples, filteredSampleId)
        if (location.latitude !== null && location.longitude !== null && location.buildingId != null && location.floorId !== null) {
          distances[filteredSampleId] = getDistanceFromLatLonInKm(location.latitude, location.longitude, sample.latitude, sample.longitude) * 1000
        } else {
          // TODO what do we do here? Sample was not located anywhere
        }
      })
      const filteredValues = Object.values(distances).filter(v => !isNaN(v)) // Exclude NaN
      const errorMean = filteredValues.reduce((acc, current) => acc + current, 0) / filteredValues.length
      const meanSquaredError = filteredValues.reduce((acc, current) => acc + current * current, 0) / filteredValues.length
      const result = { distances, errorMean, meanSquaredError }
      res.json(result)
    } catch (err) {
      res.status(400).json(err)
    }
  }
}

function getDistanceFromLatLonInKm (lat1, lon1, lat2, lon2) { // https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1) // deg2rad below
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

function deg2rad (deg) {
  return deg * (Math.PI / 180)
}

function calculateLocationFilteringSample (samples, filteredSampleId) {
  const samplesCopy = [...samples]
  const filteredSampleIndex = samplesCopy.findIndex(sample => sample._id.equals(filteredSampleId))
  if (filteredSampleIndex === -1) {
    return -1
  }
  const filteredSample = samplesCopy.splice(filteredSampleIndex, 1)[0]
  return calculateLocation(samplesCopy, filteredSample.fingerprint)
}

function calculateLocation (samples, locationFingerprint) {
  // Do algorithm
  const mainFingerprintSortedSSIDsByRSSI = sortSSIDsByRSSI(locationFingerprint)
  samples.forEach(sample => {
    sample.sortedIdsByRSSI = sortSSIDsByRSSI(sample.fingerprint)
  })

  // Calculate the building:

  // Step 1: Take AP0, the strongest AP observed in fp0.
  // Step 2: Build R’, a subset of the radio map R, with all the samples where the strongest AP is AP0.
  // Step 3: If R’ is an empty set, repeat steps 1 and 2 for the 2nd, 3rd, ..., strongest AP in fp0.
  var R0
  for (let i = 0; i < mainFingerprintSortedSSIDsByRSSI.length; i++) {
    R0 = samples.filter(sample => sample.sortedIdsByRSSI[0] === mainFingerprintSortedSSIDsByRSSI[i])
    if (R0.length > 0) break
  }
  if (!R0.length) {
    return {
      latitude: null,
      longitude: null,
      buildingId: null,
      floorId: null,
    }
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
  if (R2.length <= MIN_SAMPLES_FOR_POSITION) R2 = R1
  // Step 4: Compute the similarity, the Manhattan distance, between the fingerprint given and all the fingerprints in R’’.
  R2.forEach(sample => { sample.similarity = manhattanDistance(sample.fingerprint, locationFingerprint) })
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

  return position
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
  Return the SSIDs of the fingerprint sorted by their RSSI value in the fingerprint, from biggest to smallest
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

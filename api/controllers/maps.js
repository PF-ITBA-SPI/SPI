'use strict'

const mongoose = require('mongoose')
require('../models/Map') // Register model
const Map = mongoose.model('Map')

module.exports = {
  create: (req, res) => {
    const map = new Map(req.body)
    map.save((err, map) => { // call the save method on the instance of the model in a callback way
      if (err) {
        res.send(err)
      }
      res.json(map)
    })
  },

  list: (req, res) => {
    Map.find({}, (err, map) => {
      if (err) {
        res.send(err).status(200)
      }
      res.json(map)
    })
  },

  get: (req, res) => {
    Map.findById(req.params.mapId, (err, map) => {
      if (err) {
        res.send(err)
      } else if (map === null) {
        res.status(404).send()
      } else {
        res.json(map)
      }
    })
  },

  update: (req, res) => {
    Map.findOneAndUpdate({ _id: req.params.mapId }, req.body, { new: true }, (err, map) => {
      if (err) {
        res.send(err)
      }
      res.json(map)
    })
  },

  delete: (req, _res) => {
    Map.remove({ _id: req.params.mapId }, (err, res) => {
      if (err) {
        res.send(err)
      }
      res.json({ message: 'Map successfully deleted' })
    })
  }
}

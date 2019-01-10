'use strict'

const mongoose = require('mongoose')
require('../models/Building') // Register model
const Building = mongoose.model('Building')

module.exports = {
  create: (req, res) => {
    const building = new Building(req.body)
    building.save(function (err, building) { // call the save method on the instance of the model in a callback way
      if (err) {
        res.send(err)
      }
      res.json(building)
    })
  },

  list: (req, res) => {
    Building.find({}, function (err, building) {
      if (err) {
        res.send(err).status(200)
      }
      res.json(building)
    })
  },

  get: (req, res) => {
    Building.findById(req.query.id, function (err, building) {
      if (err) {
        res.send(err)
      } else if (building === null) {
        res.status(404).send()
      } else {
        res.json(building)
      }
    })
  },

  update: (req, res) => {
    Building.findOneAndUpdate({ _id: req.query.id }, req.body, { new: true }, function (err, building) {
      if (err) {
        res.send(err)
      }
      res.json(building)
    })
  },

  delete: (req, _res) => {
    Building.remove({ _id: req.query.id }, function (err, res) {
      if (err) {
        res.send(err)
      }
      res.json({ message: 'Building successfully deleted' })
    })
  }
}

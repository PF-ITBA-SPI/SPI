'use strict'

const mongoose = require('mongoose')
require('../models/FloorSchema') // Register model
const Floor = mongoose.model('Floor')
const Building = mongoose.model('Building')

module.exports = {

  create: (req, res) => {
    const floor = new Floor(req.body)
    const buildingId = req.query.id
    floor.save((err, floor) => { // call the save method on the instance of the model in a callback way
      if (err) {
        res.send(err)
      }
      res.json(floor)
      Building.findOneAndUpdate({ _id: buildingId }, { $push: { floors: floor._id } }, {}, err => {
        if (err) {
          res.send(err)
        }
      })
    })
  },

  list: (req, res) => {
    Building.findOne({ _id: req.query.id }, (err, building) => {
      if (err) {
        res.send(err).status(404)
      }
      Floor.find({ _id: { $in: building.floors } }, (err, floors) => {
        if (err) {
          res.send(err)
        }
        res.json(floors)
      })
    })
  },
}

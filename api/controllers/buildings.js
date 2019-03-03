'use strict'

const mongoose = require('mongoose')
require('../models/Building') // Register model
const Building = mongoose.model('Building')

module.exports = {
  create: async (req, res) => {
    const building = new Building(req.body)
    try {
      await building.save()
      res.status(201).json({ message: 'Building successfully created' })
    } catch (err) {
      res.status(400).json(err)
    }
  },

  list: async (req, res) => {
    const query = Building.find({})

    query.lean()

    try {
      const buildings = await query.exec()

      if (buildings === null) {
        return res.status(404).json({})
      }

      res.json(buildings)
    } catch (err) {
      res.status(400).json(err)
    }
  },

  get: async (req, res) => {
    const query = Building.findById(req.query.id)

    query.lean()

    try {
      const building = await query.exec()

      if (building === null) {
        return res.status(404).json({})
      }

      res.json(building)
    } catch (err) {
      res.status(400).json(err)
    }
  },

  update: async (req, res) => {
    const query = Building.findOneAndUpdate({ _id: req.query.id }, req.body, { new: true, lean: true })

    try {
      const building = await query.exec()

      if (building === null) {
        return res.status(404).json({})
      }

      res.json(building)
    } catch (err) {
      res.status(400).json(err)
    }
  },

  delete: async (req, res) => {
    const query = Building.remove({ _id: req.query.id })

    try {
      const err = await query.exec()

      if (err) {
        return res.json(err)
      }

      res.json({ message: 'Building successfully deleted' })
    } catch (err) {
      res.status(400).json(err)
    }
  },

  deleteAll: async (req, res) => {
    const query = Building.remove({ })

    try {
      const err = await query.exec()

      if (err) {
        return res.json(err)
      }

      res.json({ message: 'All buildings successfully deleted' })
    } catch (err) {
      res.status(400).json(err)
    }
  }
}

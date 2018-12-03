'use strict'

const express = require('express')
const router = express.Router()
const generateRoutes = require('../util/generate-routes')

generateRoutes(router, require('../controllers/mapCtrl'))
// Any other routes here?

module.exports = router

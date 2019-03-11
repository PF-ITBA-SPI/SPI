'use strict'

require('./util/load-config')

// Overwrite console.* to use namespaced logs
if (process.env.NODE_ENV !== 'test') {
  require('./util/logger')
}

console.log('App started in', process.env.NODE_ENV, 'mode')

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

// Set up express app and middlewares
const app = express()
app.use(cors())
app.use(bodyParser.json())

// Map API endpoint routes from documentation to code
console.debug('Mapping routes from API spec...')
const swagger = require('swagger-express-router')
const swaggerDocument = require('../swagger.json')
const controllerMappings = {
  root: require('./controllers/root'),
  buildings: require('./controllers/buildings'),
  samples: require('./controllers/samples'),
}
swagger.setUpRoutes(controllerMappings, app, swaggerDocument)

// Serve interactive documentation endpoint (Swagger UI)
const swaggerUi = require('swagger-ui-express')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Default (ie. catch-all) route: 404 not found
app.use((req, res) => {
  res.status(404).send({ url: req.originalUrl + ' not found' })
})

module.exports = app

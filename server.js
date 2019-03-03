'use strict'

require('dotenv-safe').config()

// Overwrite console.* to use namespaced logs
require('./api/util/logger')

/**
 * Connect to the current environment's database.
 *
 * @returns {Promise} Promise that resolves on successful connection, and <b>terminates the program on error</b>.
 */
const connectToDb = () => {
  const mongoose = require('mongoose')

  // Set up mongoose, connect to DB
  mongoose.Promise = global.Promise
  console.debug('Connecting to database...')
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .catch(err => {
      console.error('Connection to database failed:', err)
      process.exit(1)
    })
}

/**
 * Start the express server.
 */
const startServer = () => {
  const express = require('express')
  const cors = require('cors')
  const bodyParser = require('body-parser')

  // Set up express app and middlewares
  const app = express()
  const port = process.env.PORT
  app.use(cors())
  app.use(bodyParser.json())

  // Map API endpoint routes from documentation to code
  console.debug('Mapping routes from API spec...')
  const swagger = require('swagger-express-router')
  const swaggerDocument = require('./swagger.json')
  const controllerMappings = {
    root: require('./api/controllers/root'),
    maps: require('./api/controllers/maps')
  }
  swagger.setUpRoutes(controllerMappings, app, swaggerDocument)

  // Serve interactive documentation endpoint (Swagger UI)
  const swaggerUi = require('swagger-ui-express')
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  // Default (ie. catch-all) route: 404 not found
  app.use((req, res) => {
    res.status(404).send({ url: req.originalUrl + ' not found' })
  })

  app.listen(port)

  console.log(`spi-api started on port http://localhost:${port}`)
}

/* *********************************************************************************************************************
                                                  ACTUAL CODE
 * ********************************************************************************************************************/
console.log('App started in', process.env.NODE_ENV, 'mode')
connectToDb()
  .then(() => {
    console.log('Successfully connected to database.')
  })
  .then(startServer)

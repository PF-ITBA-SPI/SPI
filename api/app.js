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
const jwt = require('./middlewares/jwt')

// Set up express app and middlewares
const app = express()
app.use(cors())
app.use(bodyParser.json())
app.use(process.env.NODE_ENV === 'production' ? jwt.verifier : jwt.mockVerifier)

// Set permissions guard and error handler for unauthorized endpoints
const guard = require('express-jwt-permissions')()
const PUBLIC_ENDPOINTS = ['/', '/ping', /^\/api-docs/] // api-docs is a regex because it also serves some other files CSS, etc. so it's not an exact match, unlike / and /ping
app.get('/*', guard.check('user').unless({ path: PUBLIC_ENDPOINTS }))
app.post('/*', guard.check('admin'))
app.put('/*', guard.check('admin'))
app.delete('/*', guard.check('admin'))
app.use(jwt.errorHandler)

// Map API endpoint routes from documentation to code
console.debug('Mapping routes from API spec...')
const swagger = require('swagger-express-router')
const swaggerDocument = require('../swagger.json')
const controllerMappings = {
  root: require('./controllers/root'),
  buildings: require('./controllers/buildings'),
  samples: require('./controllers/samples'),
  locations: require('./controllers/locations')
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

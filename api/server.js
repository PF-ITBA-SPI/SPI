'use strict'

const app = require('./app')

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
    .then(() => {
      console.debug('Successfully connected to database.')
    })
    .catch(err => {
      console.error('Connection to database failed:', err)
      process.exit(1)
    })
}

/**
 * Start the app
 */
const startServer = () => {
  const port = process.env.PORT
  app.listen(port, () => {
    console.log(`spi-api started on port http://localhost:${port}`)
  })
}

/* *********************************************************************************************************************
                                                  ACTUAL CODE
 * ********************************************************************************************************************/
connectToDb()
  .then(startServer)

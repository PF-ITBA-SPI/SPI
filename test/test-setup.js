import { before } from 'mocha'

const mongoose = require('mongoose')
require('../api/util/load-config')

// Connect to test DB before all tests
before(() => {
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .catch(err => {
      console.error('Connection to database failed:', err)
      process.exit(1)
    })
})

const { before } = require('mocha')

const mongoose = require('mongoose')
const chai = require('chai')
require('../api/util/load-config')

// Load `should`
before(() => chai.should())

// Connect to test DB before all tests
before(() => {
  return mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
    .catch(err => {
      console.error('Connection to database failed:', err)
      process.exit(1)
    })
})

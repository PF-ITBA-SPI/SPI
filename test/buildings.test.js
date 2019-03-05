import { describe, before, beforeEach, after, it } from 'mocha'

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../api/app')
chai.use(chaiHttp)

const Building = require('../api/models/Building')

let requester = null

describe('Buildings', () => {
  before(() => {
    requester = chai.request(app).keepOpen()
  })

  after(() => {
    requester.close()
  })

  beforeEach((done) => { // Before each test we empty the database
    Building.deleteMany({}, (_err) => {
      done()
    })
  })

  describe('GET', () => {
    it('returns all buildings', (done) => {
      requester
        .get('/buildings')
        .then((res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(0)
          done()
        })
    })
  })

  describe('POST', () => {
    it('creates a building', (done) => {
      requester
        .post('/buildings')
        .send({
          name: 'Test Building',
          floors: []
        })
        .then((res) => {
          res.should.have.status(200)
          res.body.should.be.a('array')
          res.body.length.should.be.eql(0)
          done()
        })
    })
  })
})

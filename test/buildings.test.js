const { describe, before, beforeEach, after, it } = require('mocha')

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../api/app')
chai.use(chaiHttp)

const Building = require('../api/models/Building')
const sampleBuilding = {
  name: 'Test Building',
  floors: [],
  latitude: 3,
  longitude: 3,
  zoom: 3,
}
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

    it('returns one building', async done => {
      const response = await requester.post('/buildings').send(sampleBuilding)
      const building = response.body

      requester
        .get(`/buildings/${building._id}`)
        .then((res) => {
          res.should.have.status(200)
          res.body.should.eql(building)
          done()
        })
    })
  })

  describe('POST', () => {
    it('creates a building', (done) => {
      requester
        .post('/buildings')
        .send(sampleBuilding)
        .then((res) => {
          res.should.have.status(201)
          const returnedBuilding = res.body
          returnedBuilding.should.eql(sampleBuilding) // TODO NOW see this doesn't pass
          returnedBuilding._id.should.be.a('string')
          done()
        })
    })
  })
})

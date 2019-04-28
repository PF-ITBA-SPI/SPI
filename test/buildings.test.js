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

async function createBuilding () {
  return (await requester.post('/buildings').send(sampleBuilding)).body
}

describe('Buildings', function () {
  before(function () {
    requester = chai.request(app).keepOpen()
  })

  after(function () {
    requester.close()
  })

  beforeEach(function (done) { // Before each test we empty the database
    Building.deleteMany({}, function (_err) {
      done()
    })
  })

  describe('GET', function () {
    describe('With two existing buildings', function () {
      let building = null

      beforeEach(async function () {
        building = await createBuilding()
        // Create a second one but don't store it
        await createBuilding()
      })

      it('returns all buildings', function (done) {
        requester
          .get('/buildings')
          .then(function (res) {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(2)
            done()
          })
      })

      it('returns a single building', async function () {
        const res = await requester.get(`/buildings/${building._id}`)
        res.should.have.status(200)
        res.body.should.eql(building)
      })
    })

    describe('With no existing buildings', function () {
      it('returns no buildings', function (done) {
        requester
          .get('/buildings')
          .then(function (res) {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(0)
            done()
          })
      })

      it('doesn\'t return a nonexistent building', async function () {
        const res = await requester.get(`/buildings/000000000000000000000000`) // Valid but nonexistent ID
        res.should.have.status(404)
      })
    })

    it('doesn\'t accept an invalid ObjectId', async function () {
      const res = await requester.get(`/buildings/sarasa`)
      res.should.have.status(400)
    })
  })

  describe('POST', function () {
    it('creates a building', function (done) {
      requester
        .post('/buildings')
        .send(sampleBuilding)
        .then(function (res) {
          res.should.have.status(201)
          const returnedBuilding = res.body
          returnedBuilding.should.deep.include(sampleBuilding)
          returnedBuilding._id.should.be.a('string')
          done()
        })
    })
  })

  describe('PUT', function () {
    let building = null

    beforeEach(async function () {
      building = await createBuilding()
    })

    it('modifies a building', function (done) {
      const newBuilding = Object.assign({}, building, { name: 'Sarasa' })
      requester
        .put(`/buildings/${building._id}`)
        .send(newBuilding)
        .then(function (res) {
          res.should.have.status(200)
          const returnedBuilding = res.body
          returnedBuilding.should.deep.eql(newBuilding) // ID shouldn't change since we send ID
          returnedBuilding._id.should.be.a('string')
          done()
        })
    })
  })

  describe('DELETE', function () {
    let building = null

    beforeEach(async function () {
      building = await createBuilding()
      // Create a second one but don't store it
      await createBuilding()
    })

    it('deletes a single building', async function () {
      let res = await requester.delete(`/buildings/${building._id}`)
      res.should.have.status(200)
      res.body.should.eql({ message: 'Building successfully deleted' })
      // Querying it again should give 404
      res = await requester.get(`/buildings/${building._id}`)
      res.should.have.status(404)
    })

    it('deletes all buildings', async function () {
      let res = await requester.delete(`/buildings`)
      res.should.have.status(200)
      res.body.should.eql({ message: 'All buildings successfully deleted' })
      // Querying it again should give nothing
      res = await requester.get(`/buildings`)
      res.body.should.be.an('array')
      res.body.length.should.eq(0)
    })
  })
})

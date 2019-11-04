const { describe, before, beforeEach, after, it } = require('mocha')

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../api/app')
chai.use(chaiHttp)

const Building = require('../api/models/Building')
const sampleBuilding = {
  name: 'Test Building',
  floors: [
    {
      name: 'Test Floor',
      number: 0,
      overlay: {
        url: 'http://overlays.com',
        latitude: 0,
        longitude: 0,
        width: 0,
        bearing: 0,
        anchor_x: 0,
        anchor_y: 0,
      }
    }
  ],
  latitude: 3,
  longitude: 3,
  zoom: 3,
}
let building = null

const Sample = require('../api/models/Sample')
const sampleSample = {
  latitude: 0,
  longitude: 0,
  fingerprint: {
    'router1': 0,
    'router2': 0,
  }
}

let requester = null

async function createSample () {
  return (await requester
    .post(`/buildings/${building._id}/samples`)
    .send(Object.assign({ floorId: building.floors[0]._id }, sampleSample))
  ).body
}

describe('Samples', function () {
  before(function () {
    requester = chai.request(app).keepOpen()
  })

  after(function () {
    requester.close()
  })

  beforeEach(async function () { // Reset samples and create sample reference building
    await Sample.deleteMany({})
    await Building.deleteMany({})
    building = (await requester.post('/buildings').send(sampleBuilding)).body
  })

  describe('GET', function () {
    describe('With two existing samples', function () {
      let sample = null

      beforeEach(async function () {
        sample = await createSample()
        // Create a second one but don't store it
        await createSample()
      })

      it('returns all samples', function (done) {
        requester
          .get(`/buildings/${building._id}/samples`)
          .then(function (res) {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(2)
            done()
          })
      })

      it('returns a single sample', async function () {
        const res = await requester.get(`/buildings/${building._id}/samples/${sample._id}`)
        res.should.have.status(200)
        res.body.should.eql(sample)
        res.body.should.have.property('buildingId')
        res.body.buildingId.should.eql(building._id)
      })
    })

    describe('With no existing samples', function () {
      it('returns no samples', function (done) {
        requester
          .get(`/buildings/${building._id}/samples`)
          .then(function (res) {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eql(0)
            done()
          })
      })

      it('doesn\'t return a nonexistent sample', async function () {
        const res = await requester.get(`/buildings/${building._id}/samples/000000000000000000000000`) // Valid but nonexistent ID
        res.should.have.status(404)
      })
    })

    it('doesn\'t accept an invalid ObjectId', async function () {
      const res = await requester.get(`/buildings/${building._id}/samples/sarasa`)
      res.should.have.status(400)
    })
  })

  describe('POST', function () {
    it('creates a sample', function (done) {
      requester
        .post(`/buildings/${building._id}/samples`)
        .send(Object.assign({ floorId: building.floors[0]._id }, sampleSample))
        .then(function (res) {
          res.should.have.status(201)
          const returnedSample = res.body
          returnedSample.should.deep.include(sampleSample)
          returnedSample._id.should.be.a('string')
          done()
        })
    })

    it('requires a fingerprint', function (done) {
      const payload = Object.assign({ floorId: building.floors[0]._id }, sampleSample)
      delete payload['fingerprint']

      requester
        .post(`/buildings/${building._id}/samples`)
        .send(payload)
        .then(function (res) {
          res.should.have.status(400)
          res.body.should.have.property('message')
          res.body.message.should.match(/`fingerprint` is required/)
          done()
        })
    })

    it('requires a non-empty fingerprint', function (done) {
      const payload = Object.assign({ floorId: building.floors[0]._id }, sampleSample)
      payload.fingerprint = {}

      requester
        .post(`/buildings/${building._id}/samples`)
        .send(payload)
        .then(function (res) {
          res.should.have.status(400)
          res.body.should.have.property('message')
          res.body.message.should.match(/Fingerprint must not be empty, at least one AP must have been detected./)
          done()
        })
    })
  })

  describe('PUT', function () {
    let sample = null

    beforeEach(async function () {
      sample = await createSample()
    })

    it('should NOT allow modifying a sample', async function () {
      const newSample = Object.assign({}, sample, { latitude: 33 })
      requester
        .put(`/buildings/${building._id}/samples/${sample._id}`)
        .send(newSample)
        .then(function (res) {
          res.should.have.status(404)
        })
    })

    // it('modifies a sample', async function () {
    //   const newSample = Object.assign({}, sample, { latitude: 33 })
    //   requester
    //     .put(`/buildings/${building._id}/samples/${sample._id}`)
    //     .send(newSample)
    //     .then(function (res) {
    //       res.should.have.status(200)
    //       const returnedSample = res.body
    //       returnedSample.should.deep.eql(newSample) // ID shouldn't change since we send ID
    //       returnedSample._id.should.be.a('string')
    //     })
    // })
  })

  describe('DELETE', function () {
    let sample = null

    beforeEach(async function () {
      sample = await createSample()
      // Create a second one but don't store it
      await createSample()
    })

    it('deletes a single sample', async function () {
      let res = await requester.delete(`/buildings/${building._id}/samples/${sample._id}`)
      res.should.have.status(200)
      res.body.should.eql({ message: 'Sample successfully deleted' })
      // Querying it again should give 404
      res = await requester.get(`/buildings/${building._id}/samples/${sample._id}`)
      res.should.have.status(404)
    })

    it('deletes all samples', async function () {
      let res = await requester.delete(`/buildings/${building._id}/samples`)
      res.should.have.status(200)
      res.body.should.eql({ message: `All samples for building ${building._id} successfully deleted` })
      // Querying it again should give nothing
      res = await requester.get(`/buildings/${building._id}/samples`)
      res.body.should.be.an('array')
      res.body.length.should.eq(0)
    })
  })
})

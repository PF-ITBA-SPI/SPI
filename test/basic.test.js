import { describe, before, after, it } from 'mocha'

const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../api/app')
chai.use(chaiHttp)

let requester = null

describe('Basic test', () => {
  before(() => {
    requester = chai.request(app).keepOpen()
  })

  after(() => {
    requester.close()
  })

  describe('GET root', () => {
    it('it should return api name', (done) => {
      requester
        .get('/')
        .end((_err, res) => {
          res.should.have.status(200)
          res.text.should.be.a('string')
          res.text.should.be.eql('spi-api')
          done()
        })
    })
  })

  describe('GET /ping', () => {
    it('it should return pong', (done) => {
      requester
        .get('/ping')
        .end((_err, res) => {
          res.should.have.status(200)
          res.text.should.be.a('string')
          res.text.should.be.eql('pong')
          done()
        })
    })
  })
})

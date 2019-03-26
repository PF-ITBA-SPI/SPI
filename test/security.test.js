const { describe, before, after, it } = require('mocha')
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../api/app')
chai.use(chaiHttp)
const jwt = require('jsonwebtoken')

const ADMIN_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA5eLaNfjLSDfzRgEa1FdlM5sDPiyA7UJoSlU9Xenklxy5UVax\nqiljJGe590ZMHvy6huaOrtzlbKQi8fs19Q2obp/Igwo6woKcHv3/XDYXiCDhPL7t\n2YNE20MyGlk9DA7ITrUnP5QZJlcsuabyH/2bHbFTo6GEoOf8amDyvcNhxS8cQ6NZ\nFzQjyGhRWotxmHs37TJ9pW2kBrxvtyZZvcmArRp1MNDMBJEemZTF9vz4VuS2xtgn\n11fcRferUyQSXBRTb8hPEZyhBA0vX2h9r6XCCQGJnKDEslYAJf9mqzbQIegQWtN7\n/iadKNQWBQW7BgTjlGsNEKjRtjaSmyBjEsM4+QIDAQABAoIBAAJIlZhRp1tJSv5Y\nBnczgwrXMFoOwR0aOsT6QcjMCPxDScf4D328OYLkEOHW7eyk4Al1AtfT0+eXXc1/\njFKp1xF6PtimYl0KRRi9tyqoUuWERhh/YQd3GVkAOuAuIMAc6Xp2rDQieXl7BjO1\n59PPhhnuaAFJGnMqusQnwGGILlFyGIidxztktrVG1WVXG9pdJTQ4k5DynZbxWCC9\n4gFjofK+DAGvlXut9pGEVKOGqF1vHxTKfLxI8qgMQxthQMPXQgvCprENVJygKTBG\nowLNJJ0Qs5gvYTKVmHS6xjVDm+Et/AiEkj4KhHt+IsuBjTVrtmNDJec4aXwKXglw\nmKZIcQ0CgYEA+HwYb3poKJ+aTyKnrRUl0RAWHb0C5iktI82ykrsxCWeJE1EPV+JZ\ns8jRzJ//aibrGedfDeKfBPKWhtMDGzziYLGQSq7uL/M741kn/1Zih2MFJgiORnh0\nzagwmpN81t8UT6uuZWK88wfSLenar0ZBb8SiAtBCGmjqbfEsWTk0xgMCgYEA7NbB\nofmfgUInAosO8rrIAUNwnKd17zG9RyjChmlftNz3uUdW0Z8Xd5qItouRdPvgPiLj\nEcmXC6DhRz8aOSZDsEcvlNJaa5PbM3jA+Hlypevb4j8kboK17MKI0yfr29ninLOg\nRGAgtYdmdpmn0MYWG7xOSKHNEyR1ZzKNXg0JAlMCgYA4fl4/2iCcO80leMeOfmRe\np72ffT2PfoUYwsd6vLxlWvi7P46xeHDUgy/PygCT7c090nC2A3QL9+tpM8hdBPai\n7TvU/viARlizU63YS5eTGFwvTXqrYu+LYlXKjwWvBIDlrC62NkCnMHwEnEpv1xVB\nh/8djKO6xWenH1Hp5yusaQKBgQCHeZDphlCnL6AA5Gp4jj85+cnA0kmzuU/8FGSx\nXjVQz9UkNpqC7e4OjGcHhG5/7FQpNuuMkTPFgxFaH85wQmMVwqKFDo6KWtlYaAp6\nF35tSq1MjbHZRQurktuRbZSM/eWSnW1fr10GeZ0y2lIUKjsbQmvFQEh+WqyNi20y\nD2LH4QKBgQDogKULL7qSFSgE5C32Nyi/3qxvwpiKvbLvCjDwdhOcxPYSMHYd8Jy3\nICH+/5pA3fjTSJmSYp/sFXmKjdxTq+3YmNEzWidEoqpSlmxk/245FdGP7W7rCj9p\nkq6KT1BYRzi6BBAp0juzDdoI2V0i4sn0uy6RvmWyRozSnWeNXGiKZA==\n-----END RSA PRIVATE KEY-----'
const USER_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA0HIXw2J8kZ9+qbhpCfd2vkQqRAUS2xVqiaTGsBU4Hz4Ou5RK\nSvw9dqtEWfT5usMnJ9cM0or9okd387YBpCSiy/RHGkKVLcoLiZMtvP6al6XajZCC\nXXXNOUFmDh18YTKXKQK3nHYubR4I96NYtLoKvZei+Vp9S6iunGfeVZ10pqvBz8Hm\nkAFf00QPMiM3Gcc5VgNysj85NU9WCIJrTQkeWZM9ltBh/F5NJVs1BfUj5czZcGNw\nNKuMe9B4GzNz2fmeUCpNstx6tWd5IZXlgfEnrbSQYkCFldRkkFcgwvdi3PozthxE\nFOVL6r7Z7kNeKWiA5NjmEbRVBPYQ0H5GSKLO2wIDAQABAoIBACIYh4qOMZIgZLee\nUpAuyl2VCNTXf54WgrbBHT7wOZ3iqMZGG2DooaUnnqaYS8Eg6ua5Zn+J/LLuvdA/\nlUUkOPzjmD3TZlN3GSwHxxODEgZ8OqOtX6Wp/0e+StNEP3QmslMi/qW5Lx7qKs1X\nCsuFIvygMShYhOY7UVSEKPoYJ1ybsCMvS+0pFbtr6Rl/u841v3af2NXeq1qbxEYT\neBBHwb8srA30tQrMnPA0pqB1g0QuVoGr6Ynd/X4H2iRbu5fUbiZU0bigoFaHooZi\nZ2VlJERYuFSzgDgSatACAZTU8GBdZ9qcslZotLCKVeEQBCgGzh9jxwscA0XwR0B3\n5dvBvQECgYEA6sZC5FhQi6USSJhRnC8XUgXBrMSy80H/Sv3nOUnzIXW7v9nT1uXA\nNQE1JoVcEhwtF9MwooQGgSBsEFIbhKUH/Yf7LEncJuk+xFeXlRmVH9SskuVDogdC\n6omlmRDrjqkRTRR58z9/SsOxX9wnR/8ByHA+b4M6qh75EtgR0GQXHC8CgYEA40p3\nAYm4ZsuTe5UF0yINkjG0y4XSjGpaxLFk+6pyBeUGmiQh6p9dt+48b9AqLK84uA/E\nfnWfhPTdVSdUTkMUozMZKLsYL1P+E/oE3NSS0iDvnaU08EWGtZL/DmjpUQT3OVp0\n64F1BeYe5k/eED4CFYmSqu3stxQi4tL/y8aPsRUCgYEAynZBl3QFufeXxdz9fAgs\nP0LRm7FhdWBzzXMapQ/9yNwkFjW+dvNZBxzMfjTBiqibxpEMvwnGJjMUnhqAuqor\nMtvCopXrce7xfxbelOkj7fhU/rUR1zgV3/bmRRMPYM6yKdu/syMOHiaW30kW4wKp\nwfXyEe6Ed9MQDs0gx6qZN2cCgYEAuvoyJjC+YsoL3Hk+Xm7ADUkYuuiuyVZgrzhj\no2iW/mRm5vzcbd+GQF4al7z+RN4sYbaO5Z0rijvJrFh7URp76rmJc+ldvulwtcxS\nnbu9wGDZ3azffN0lMU/oxFjnvv+/xQ2161sHAsBJIRwIyQHJwx/2aOjrd7x36nK7\nfU4uPPUCgYBS/35scF3U7VkrokU7ReQaWVAjafZD8GUZ9EihZ/e2kF+901jIecRg\nLVsTwahzc95vfCFsU6+IR5s+mXeyPE+YgZhrmfnoA70TlzD691ax8MPNdFk1f6Nk\nC4sQTpAH0kuZ6sGb3nDjAI/M72j3hDTKJgifzYwUPUj7rxJsIxWYEg==\n-----END RSA PRIVATE KEY-----'

let requester = null

const Building = require('../api/models/Building')
function createBuilding (token) {
  return requester
    .post('/buildings')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Test Building',
      floors: [],
      latitude: 3,
      longitude: 3,
      zoom: 3,
    })
}

const signJwt = privateKey => jwt.sign({}, privateKey, { algorithm: 'RS256' })
const decodeJwt = (token, publicKey) => jwt.verify(token, publicKey, { algorithm: 'RS256' })

describe('Security', function () {
  before(function (done) {
    requester = chai.request(app).keepOpen()
    done()
  })

  after(function () {
    requester.close()
  })

  describe('As admin', function () {
    let token = 'admin'

    after(function (done) {
      // Clean up
      Building.deleteMany({}, done)
    })

    it('signs and verifies the same JWT with the admin keypair', function (done) {
      let testToken
      let testFn = () => { testToken = signJwt(ADMIN_PRIVATE_KEY) }
      testFn.should.not.throw()
      testFn = () => decodeJwt(testToken, process.env.ADMIN_PUBLIC_KEY)
      testFn.should.not.throw()
      done()
    })

    it('allows to GET /', function (done) {
      requester
        .get('/')
        .set('Authorization', `Bearer ${token}`)
        .end((_err, res) => {
          res.should.have.status(200)
          res.text.should.be.a('string')
          res.text.should.be.eql('spi-api')
          done()
        })
    })

    it('allows to GET /buildings', function (done) {
      requester
        .get('/buildings')
        .set('Authorization', `Bearer ${token}`)
        .end((_err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          done()
        })
    })

    it('allows to POST /buildings', function (done) {
      createBuilding(token).then(response => {
        response.should.have.status(201)
        response.body.should.be.an('object')
        done()
      })
    })

    it('allows to PUT /buildings/{buildingId}', async function () {
      const buildingResponse = await createBuilding(token)
      buildingResponse.should.have.status(201)

      const building = buildingResponse.body
      const putResponse = await requester
        .put(`/buildings/${building._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(Object.assign(building, { name: 'Sarasa' }))
      putResponse.should.have.status(200)
      putResponse.body.should.be.an('object')
    })

    it('allows do DELETE /buildings/{buildingId}', async function () {
      const buildingResponse = await createBuilding(token)
      buildingResponse.should.have.status(201)

      const building = buildingResponse.body
      const deleteResponse = await requester
        .delete(`/buildings/${building._id}`)
        .set('Authorization', `Bearer ${token}`)
      deleteResponse.should.have.status(200)
      deleteResponse.body.should.eql({ message: 'Building successfully deleted' })
    })
  })

  describe('As user', function () {
    let token = 'user'

    after(function (done) {
      // Clean up
      Building.deleteMany({}, done)
    })

    it('signs and verifies the same JWT with the user keypair', function (done) {
      let testToken
      let testFn = () => { testToken = signJwt(USER_PRIVATE_KEY) }
      testFn.should.not.throw()
      testFn = () => decodeJwt(testToken, process.env.USER_PUBLIC_KEY)
      testFn.should.not.throw()
      done()
    })

    it('allows to GET /', function (done) {
      requester
        .get('/')
        .set('Authorization', `Bearer ${token}`)
        .end((_err, res) => {
          res.should.have.status(200)
          res.text.should.be.a('string')
          res.text.should.be.eql('spi-api')
          done()
        })
    })

    it('allows to GET /buildings', function (done) {
      requester
        .get('/buildings')
        .set('Authorization', `Bearer ${token}`)
        .end((_err, res) => {
          res.should.have.status(200)
          res.body.should.be.an('array')
          done()
        })
    })

    it('does not allow to POST /buildings', function (done) {
      createBuilding(token).then(response => {
        response.should.have.status(403)
        done()
      })
    })

    it('does not allow to PUT /buildings/{buildingId}', async function () {
      const buildingResponse = await createBuilding('admin') // Create building as admin
      buildingResponse.should.have.status(201)

      const building = buildingResponse.body
      const putResponse = await requester
        .put(`/buildings/${building._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(Object.assign(building, { name: 'Sarasa' }))
      putResponse.should.have.status(403)
    })

    it('does not allow do DELETE /buildings/{buildingId}', async function () {
      const buildingResponse = await createBuilding('admin') // Create building as admin
      buildingResponse.should.have.status(201)

      const building = buildingResponse.body
      const deleteResponse = await requester
        .delete(`/buildings/${building._id}`)
        .set('Authorization', `Bearer ${token}`)
      deleteResponse.should.have.status(403)
    })
  })

  describe('Unauthenticated', function () {
    let token = 'invalidToken'

    after(function (done) {
      // Clean up
      Building.deleteMany({}, done)
    })

    it('allows to GET /', function (done) {
      requester
        .get('/')
        .set('Authorization', `Bearer ${token}`)
        .end((_err, res) => {
          res.should.have.status(200)
          res.text.should.be.a('string')
          res.text.should.be.eql('spi-api')
          done()
        })
    })

    it('does not allow to GET /buildings', function (done) {
      requester
        .get('/buildings')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          res.should.have.status(403)
          done()
        })
    })

    it('does not allow to POST /buildings', function (done) {
      createBuilding(token).then(response => {
        response.should.have.status(403)
        done()
      })
    })

    it('does not allow to PUT /buildings/{buildingId}', async function () {
      const buildingResponse = await createBuilding('admin') // Create building as admin
      buildingResponse.should.have.status(201)

      const building = buildingResponse.body
      const putResponse = await requester
        .put(`/buildings/${building._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(Object.assign(building, { name: 'Sarasa' }))
      putResponse.should.have.status(403)
    })

    it('does not allow do DELETE /buildings/{buildingId}', async function () {
      const buildingResponse = await createBuilding('admin') // Create building as admin
      buildingResponse.should.have.status(201)

      const building = buildingResponse.body
      const deleteResponse = await requester
        .delete(`/buildings/${building._id}`)
        .set('Authorization', `Bearer ${token}`)
      deleteResponse.should.have.status(403)
    })
  })

  it('Does not sign and verify with mismatching keypairs', function (done) {
    let testToken

    // Sign with admin, verify with user
    let testFn = () => { testToken = signJwt(ADMIN_PRIVATE_KEY) }
    testFn.should.not.throw()
    testFn = () => decodeJwt(testToken, process.env.USER_PUBLIC_KEY)
    testFn.should.throw()

    // Sign with user, verify with admin
    testFn = () => { testToken = signJwt(USER_PRIVATE_KEY) }
    testFn.should.not.throw()
    testFn = () => decodeJwt(testToken, process.env.ADMIN_PUBLIC_KEY)
    testFn.should.throw()
    done()
  })
})

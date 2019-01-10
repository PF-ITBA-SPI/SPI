'use strict'

module.exports = {
  root: (req, res) => {
    res.status(200).send('spi-api')
  },
  ping: (req, res) => {
    res.status(200).send('pong')
  },
}

'use strict'

/**
 * Generic basic routes generator. Maps the following routes to the following controller functions:
 * <ul>
 *   <li>GET / => list</li>
 *   <li>GET /:id => get</li>
 *   <li>POST / => create</li>
 *   <li>PUT /:id => update</li>
 *   <li>DELETE /:id => delete</li>
 * </ul>
 *
 * @param router {object} Express router. Instance one with: <pre>const express = require('express'); const router = express.Router()</pre>
 * @param controller {object} Controller to which to map the previously-mentioned routes.
 */
module.exports = function (router, controller) {
  router.get('/', controller.list)
  router.get('/:id', controller.get)

  router.post('/', controller.create)

  router.put('/:id', controller.update)

  router.delete('/:id', controller.delete)
}

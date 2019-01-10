'use strict'

module.exports = function (app) {
  const buildingController = require('../controllers/buildingController')

  app.route('/buildings')
    .get(buildingController.listBuildings)
    .post(buildingController.createBuilding)

  app.route('/building/:buildingId')
    .get(buildingController.getBuilding)
    .put(buildingController.updateBuilding)
    .delete(buildingController.deleteBuilding)
}

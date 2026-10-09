/**
 * Created by Franklin on 2017/3/17.
 */
// var ModelSerModel = require('./modelService');
// var ModelSerModel = require('./modelService_n');
var ModelSerModel = require('./dbSwitcher').modelService;

var ModelFactory = function () {};

module.exports = ModelFactory;

ModelFactory.createMsModel = function () {
  return ModelSerModel;
};
'use strict';

var _ = require('lodash');

var BaseController = function() {};

// Add default behaviours to the controllers
BaseController.prototype.index = function(req, res) {
    res.ok();
};

BaseController.createResponse = function(data) {
    console.log("Inside Base Controller", data);
    return true;
}

BaseController.extend = function(object) {
    return _.extend({}, BaseController.prototype, object);
};

module.exports = BaseController;
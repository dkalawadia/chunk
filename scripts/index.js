/**
 * (C) 2014 Dinesh Kalawadia <http://github.com/dkalawadia>
 * MIT LICENSE
 */
var appModel = require('../model/appModel.js').appModel;
var axis = require('./axis.js');
var xoom = require('./xoom.js');
var icici = require('./icici.js');
var indus = require('./indus.js');
var appModel = new appModel();

setInterval(function() {
    axis.parseAxisbank(appModel);
    icici.parseICICIBank(appModel);
    xoom.parseXoom(appModel);
    indus.parseIndus(appModel);
}, 60000);
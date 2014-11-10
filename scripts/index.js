/**
 * (C) 2014 Dinesh Kalawadia <http://github.com/dkalawadia>
 * MIT LICENSE
 */
var appModel = require('../model/appModel.js').appModel;
var axis = require('./axis.js');

var appModel = new appModel();

//setInterval(function() {
    axis.parseAxisbank(appModel);
//}, 5000);
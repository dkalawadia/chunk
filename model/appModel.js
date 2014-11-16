/**
 * Created by Dinesh Kalawadia<http://github.com/dkalawadia> on 10/27/2014.
 */

var mongoose = require('mongoose');
var moment = require('moment');
var db = mongoose.createConnection('127.0.0.1:27017/remittance' );
//mongoose.createConnection('localhost:27017/remittance');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;


var AppModel = function() {


   /**
     *
     * @type {mongoose.Schema}
     * Captures the Currency Exchange Rates
     */
    var Remittance = new Schema({
        companyName: String,
        companyAbbr: String,
        companyUrl: String,
        fromCurrency: String,
        ToCurrency: {type:String, default:"INR"},
       /*fromCountry: String,
        ToCountry: {type:String, default:"IND" },*/
        exchangeMode: String,
        exchangeType: String,
        insertDate: {type: String, default: moment().month()+"-"+moment().date()+"-"+moment().year()},
        updateDate: { type: Date, default: moment().format() },
        exchangeRates: [
            {
                slabSeq: Number,
                slabRange: String,
                xrate: Number
            }
        ]
    })
    this.Remittance = db.model('Remittance', Remittance);
};
exports.appModel = AppModel;
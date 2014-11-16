/**
 * (C) 2014 Dinesh Kalawadia <http://github.com/dkalawadia>
 * MIT LICENSE
 */
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var mailer = require('../util/mailer.js');

/*
 * This function does the web scraping of Xoom's exchange rates
 * */
var parseXoom = function(appModel){
    request = request.defaults({jar:true,proxy:'http://webproxy.merck.com:8080'});
    var url = 'https://www.xoom.com/ajax/options-xfer-amount-ajax?receiveCountryCode=IN&sendAmount=50';
    request(url, function(err, resp, body){
        if(err) {
            console.log(err);
        }else {
            var json = JSON.parse(body);
            console.log(json.result.fxRate);
            var exchangeRates = new Array();
            var ExchangeRate = {
                slabSeq: 1,
                slabRange: "25 - 9999",
                xrate: json.result.fxRate
            }
            exchangeRates.push(ExchangeRate);
            // creating remit schema
            var remit = {
                companyName: "XOOM",
                companyAbbr: "XOOM",
                companyUrl: "https://www.xoom.com/india/send-money",
                fromCurrency: "USD",
                exchangeMode: "ONLINE",
                exchangeType: "FIXED",
                insertDate: moment().month() + "-" + moment().date() + "-" + moment().year(),
                updateDate: moment(),
                exchangeRates: exchangeRates
            };
            // Below code does the update to record if the condition is satisfied or inserts a new record
            appModel.Remittance.update(
                {
                    fromCurrency: "USD",
                    exchangeMode: "ONLINE",
                    exchangeType: "FIXED",
                    companyAbbr: "XOOM",
                    insertDate: moment().month() + "-" + moment().date() + "-" + moment().year()
                },
                remit,
                {
                    upsert: true,
                    multi: true
                },
                function (err, s, a) {
                    if (err) console.log('Error saving ExchangeRate ' + err);
                    else console.log(a);
                }
            );
        }
    });
}
module.exports.parseXoom = parseXoom;
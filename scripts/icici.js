/**
 * (C) 2014 Dinesh Kalawadia <http://github.com/dkalawadia>
 * MIT LICENSE
 */
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');
var _      = require('underscore');

var currencyId = {
 "USD": 99,  "EUR": 100, "GBP": 102,
 "CHF": 103, "SEK": 104, "SGD": 107,
 "AUD": 108, "CAD": 109, "AED": 110,
 "HKD": 111
 };
var productId = {
    "100001":"WIRE", "100002":"ONLINE", "100005":"ONLINE", "100013":"EXPRESS"
}
var currencyProdId = {
    "99" :"100001,100002,100013", "100":"100001,100005", "102":"100001,100005",
    "103":"100001", "104":"100001", "107":"100001,100005", "108":"100001,100005",
    "109":"100001,100002,100013", "110":"100001", "111":"100001,100005"
}

var transferType = new Array("FIXED","INDICATIVE");

/*
 * This function does the web scraping of ICICI bank exchange rates
 * */
var parseICICIBank = function(appModel){
    request = request.defaults({jar:true})
    var currencyName = _.keys(currencyId);
    var currencyIds  = _.values(currencyId);
    var count=0;
    currencyIds.forEach(function(currencyId){
        var prodIds = _.map(_.pick(currencyProdId,currencyId),function(val,key){
                return val;
        });
        prodIds = prodIds[0].split(",");
        var currency = currencyName[count];
        count++;
        prodIds.forEach(function(prodId){
            transferType.forEach(function(type){
                var url;
                var exchangeRates = new Array();
                var mode= _.map(_.pick(productId,prodId),function(val,key){
                    return val;
                })[0];
               if(type=="FIXED"){

                   url = 'https://m2inet.icicibank.co.in/m2iNet/exRateCalculator?' +
                       'productId=' +prodId +
                       '&txnAmount=0' +
                       '&txnFixedAmount=50000' +
                       '&fixedInr=Y' +
                       '&deliveryMode=200001' +
                       '&currency='+currencyId;
               }else{
                   url = 'https://m2inet.icicibank.co.in/m2iNet/exRateCalculator?' +
                       'productId=' +prodId +
                        '&txnAmount=1500' +
                   '&txnFixedAmount=0' +
                   '&fixedInr=N' +
                   '&deliveryMode=200001' +
                   '&currency='+currencyId;
               }
                request("https://m2inet.icicibank.co.in/m2iNet/exchangeRate.misc",function(e,r,b){
                    if(e) throw e;
                    console.log(url);
                    request.post(url, function(err, resp, body){
                        console.log(body);
                        if(err)
                            throw err;
                        $ = cheerio.load(body,{
                            ignoreWhitespace: true,
                            xmlMode: true
                        });
                         // getting the number of HTML table body tag
                        $('tbody').each(function(i){ //iterate through all HTML table body
                            $(this).find('tr').each(function(seq) { // finding all TRs and iterating through it.

                                var slab1, slab2, exRate;
                                $(this).find('td').each(function (index) { // Finding all TD and iterating through it.
                                    if (index == 0) slab1 = $(this).text().trim();
                                    else if (index == 1) slab2 = $(this).text().trim();
                                    else if (index == 2) exRate = $(this).text().trim();
                                });
                                var ExchangeRate = {
                                    slabSeq: seq+1,
                                    slabRange: slab1 +" - "+ slab2,
                                    xrate: exRate
                                }
                                exchangeRates.push(ExchangeRate);

                            });
                            // creating remit schema
                            var remit = {
                                companyName: "ICICI BANK",
                                companyAbbr: "ICICI",
                                companyUrl: "http://www.money2india.com/",
                                fromCurrency: currency,
                                exchangeMode: mode,
                                exchangeType: type,
                                insertDate: moment().month()+"-"+moment().date()+"-"+moment().year(),
                                updateDate: Date.now(),
                                exchangeRates:exchangeRates
                            };

                            // Below code does the update to record if the condition is satisfied or inserts a new record
                            appModel.Remittance.update(
                                {
                                    fromCurrency:currency,
                                    exchangeMode: mode,
                                    exchangeType: type,
                                    companyAbbr: "ICICI",
                                    insertDate:moment().month()+"-"+moment().date()+"-"+moment().year()
                                },
                                remit,
                                {
                                    upsert:true,
                                    multi:true
                                },
                                function(err, s, a) {
                                    if (err) console.log('Error saving ExchangeRate ' + err);
                                    else console.log(a);
                                }
                            );
                        });
                    });
                });
            });
        });
    });
}

module.exports.parseICICIBank = parseICICIBank;

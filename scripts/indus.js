/**
 * (C) 2014 Dinesh Kalawadia <http://github.com/dkalawadia>
 * MIT LICENSE
 */
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

/*
 * This function does the web scraping of Xoom's exchange rates
 * */
var parseIndus = function(appModel){
    request = request.defaults({jar:true,proxy:'http://webproxy.merck.com:8080'});
    var url = 'https://www.indusfastremit.com';
    request({url:url,
        headers:{
            'User-Agent':'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.111 Safari/537.36'
        }
    }, function(err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body, {
            ignoreWhitespace: true,
            xmlMode: true
        });
        var results;
        $('div.copy2').each(function (i) {
            results=$(this).text().split(/[\s,]+/);
        });
        for(var i=0; i<3; i++){
            var exchangeRates = new Array();
            var currency, xrate;
            switch(i) {
                case 0:
                    currency= results[4];
                    xrate=results[7];
                    break;
                case 1:
                    currency= results[8];
                    xrate=results[11];
                    break;
                case 2:
                    currency= results[12];
                    xrate=results[15];
                    break;
            }

            var ExchangeRate = {
                slabSeq: 1,
                slabRange: "0 - 9999",
                xrate: xrate
            }
            exchangeRates.push(ExchangeRate);
            // creating remit schema
            var remit = {
                companyName: "INDUS FAST REMIT",
                companyAbbr: "INDUS",
                companyUrl: "https://www.indusfastremit.com/",
                fromCurrency: currency,
                exchangeMode: "ONLINE",
                exchangeType: "FIXED",
                insertDate: moment().month() + "-" + moment().date() + "-" + moment().year(),
                updateDate: moment(),
                exchangeRates: exchangeRates
            };
            // Below code does the update to record if the condition is satisfied or inserts a new record
            appModel.Remittance.update(
                {
                    fromCurrency: currency,
                    exchangeMode: "ONLINE",
                    exchangeType: "FIXED",
                    companyAbbr: "INDUS",
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
module.exports.parseIndus = parseIndus;
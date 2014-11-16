/**
 * (C) 2014 Dinesh Kalawadia <http://github.com/dkalawadia>
 * MIT LICENSE
 */
var request = require('request');
var cheerio = require('cheerio');
var moment = require('moment');

// Axis bank supports for Canada, Europe, Hongkong, Singapore, United Arab Emirates, Great Britain, United States
var country = new Array('CA','EU','HK','SG','AE','GB','US');

/*
* This function does the web scraping of Axis bank exchange rates
* */
var parseAxisbank = function(appModel){
    request = request.defaults({jar:true,proxy:'http://webproxy.merck.com:8080'})
    country.forEach(function(cntry){
        var url = 'https://axisremit.axisbank.co.in/remittance/showExchangeRates.action?fromCountry='+cntry;
        request(url, function(err, resp, body){
            if(err)
                throw err;
            $ = cheerio.load(body,{
                ignoreWhitespace: true,
                xmlMode: true
            });
            var tableLen= $('#gridTable').length // getting the number of HTML table tag
            $('#gridTable').each(function(i){ //iterate through all HTML tables
                var exchangeRates = new Array();
                var mode,type,currency;
                if(tableLen==2&&i==0){
                    mode="ONLINE";type="FIXED"
                }else if(tableLen==2&&i==1){
                    mode="WIRE";type="FIXED"
                }else if(tableLen==4){
                    if(i==0){
                        mode="ONLINE";type="FIXED";
                    }else if(i==1){
                        mode="ONLINE";type="INDICATIVE";
                    }else if(i==2){
                        mode="WIRE";type="FIXED";
                    }else if(i==3){
                        mode="WIRE";type="INDICATIVE";
                    }
                }
                $(this).find('tr').each(function(seq) { // finding all TRs and iterating through it. Also ignores first TR.
                    if(seq!=0){
                        var slab1, slab2, exRate;
                        $(this).find('td').each(function (index) { // Finding all TD and iterating through it.
                            if (index == 0) slab1 = $(this).text().trim();
                            else if (index == 1) slab2 = $(this).text().trim();
                            else if (index == 2) currency = $(this).text().trim();
                            else if (index == 3) exRate = $(this).text().trim();
                        });
                        var ExchangeRate = {
                            slabSeq: seq+1,
                            slabRange: slab1 + slab2,
                            xrate: exRate
                        }
                        exchangeRates.push(ExchangeRate);
                    }
                });

                // creating remit schema
                var remit = {
                    companyName: "AXIS BANK",
                    companyAbbr: "AXIS",
                    companyUrl: "http://www.axisbank.com/nri/usa-canada/remitance/send-money.aspx",
                    fromCurrency: currency,
                    exchangeMode: mode,
                    exchangeType: type,
                    insertDate: moment().month()+"-"+moment().date()+"-"+moment().year(),
                    updateDate: moment(),
                    exchangeRates:exchangeRates
                };

               // Below code does the update to record if the condition is satisfied or inserts a new record
                appModel.Remittance.update(
                    {
                        fromCurrency:currency,
                        exchangeMode: mode,
                        exchangeType: type,
                        companyAbbr:"AXIS",
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
}

module.exports.parseAxisbank = parseAxisbank;
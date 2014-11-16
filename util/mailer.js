/**
 * (C) 2014 Dinesh Kalawadia <http://github.com/dkalawadia>
 * MIT LICENSE
 */
var nodemailer = require('nodemailer');

var sendEmail = function(subject,content){

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '',
            pass: ''
        }
    });
    transporter.sendMail({
        from: '',
        to: '',
        subject: subject,
        text: content
    },function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}
module.exports.sendEmail = sendEmail;
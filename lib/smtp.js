var nodemailer = require('nodemailer')
var config = require('config')

module.exports.smtpTransport = nodemailer.createTransport('SMTP', {
    service: 'SendGrid',
    auth: {
        user: process.env.SENDGRID_USER || config.get('emailVerification.user'),
        pass: process.env.SENDGRID_PASS || config.get('emailVerification.pass')
    }
})

const nodemailer = require('nodemailer');

const dadesPerAccedirServidorCorreu = () => {
    return nodemailer.createTransport({
        service: 'localhost',
        port: 25,
        secure: false,
        auth: {
            user: 'admin',
            pass: 'admin'
        }
    });

}

module.exports = {dadesPerAccedirServidorCorreu}
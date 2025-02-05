const express = require('express');
const cors = require('cors');
var admin = require("firebase-admin");
const jp = require('jsonpath');
var serviceAccount = require("oscarmollinedoechevarriadam1-firebase-adminsdk-fbsvc-5b118456bb.json");
var nodemailer = require('nodemailer');
const db = admin.firestore();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '',
        pass: ''
    }
});

const app = express();
app.use(cors());
app.use(express.json());

const port = 3080;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

app.get('/exemple', async (req, res) => {
    const datos = { name : "paco", mail: 'paco@gmail.com'}
    res.json(datos);
});

app.post('/correu', async (req, res) => {
    let correu = req.body;
    let mailOptions = {
        from: '',
        to: 'req.body',
        subject: 'Correu recuperacio compte',
        text: 'aixo es un correu per actualitzar la teva compte'
    };
});

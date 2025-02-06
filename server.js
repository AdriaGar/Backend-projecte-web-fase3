const express = require('express');
const cors = require('cors');
var admin = require("firebase-admin");
const jp = require('jsonpath');
var serviceAccount = require("./KeyFirebase.json");
var nodemailer = require('nodemailer');
const app = express();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
app.use(cors({
    origin: 'http://localhost:4200'
}));
app.use(express.json());
const port = 3080;


var transporter = nodemailer.createTransport({
    service: 'localhost',
    auth: {
        user: '',
        pass: ''
    }
});
const db = admin.firestore();
const dbC = db.collection('usuaris');

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

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('correu enviat: ' + info.response);
        }
    });
});

app.post('/usuaris/push', async (req, res) => {
    let usuario = req.body
    let nomDocument = usuario.usuari
    let dades = usuario.dades
    let pujada = await dbC.doc(nomDocument).set(dades)
});

app.get('/usuaris/informaciopersonal',async (req, res) => {
    const documentid = req.query.usuariId;

    const nomDocument = await dbC.doc(documentid).get();

    const usuariData = document.data();
    const usuari = ({
        CVVTarjeta: usuariData.CVVTarjeta,
        DNI: usuariData.DNI,
        apellido: usuariData.apellido,
        correo: usuariData.correo,
        cumpleaños: usuariData.cumpleaños,
        direccion: usuariData.direccion,
        fechaTarjeta: usuariData.fechaTarjeta,
        nombre: usuariData.nombre,
        numeroTarjeta: usuariData.numeroTarjeta,
        telefono: usuariData.telefono,
        titularTarjeta: usuariData.titularTarjeta
    });
    res.json(usuari);
    console.log("Dades:" + usuari);

});
app.put('/usuaris/informaciopersonal', async (req, res) => {
    const usuario = req.body;
    const documentid = usuario.usuario;

    await dbC.doc(documentid).set(usuario);
    res.send('Datos actualizados correctamente');
    console.log('Datos actualizados:', usuario);

});
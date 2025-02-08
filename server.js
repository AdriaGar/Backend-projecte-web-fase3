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
    port: 25,
    secure: false,
    auth: {
        user: 'admin',
        pass: 'admin'
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

app.post('/mail', async (req, res) => {
    let usuari = req.body;

    const document = await dbC.doc(usuari.usuariid.trim()).get();
    
    const dades = document.data();
    
    console.log(dades)
    
    let mailOptions = {
        from: 'BobbyCotxes@cotxesbobby.com',
        to: dades.correo,
        subject: 'Correu recuperacio compte de ECommerce Bobby Cotxes',
        html: `<!DOCTYPE html>
        <html lang="ca">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Bobby Cotxes: Recuperació compte</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                    }
                    .title {
                        color: #2c3e50;
                    }
                    h1 {
                        font-size: 24px;
                    }
                    p {
                        font-size: 16px;
                    }
                </style>
            </head>
            <body>
                <h1 class="title">Bobby Cotxes: Recuperació compte</h1>
                <p>Bon dia, ${dades.nombre},</p>
                <p>Hem rebut una petició per canviar la contrasenya del teu compte d'usuari ${dades.nombre}.</p>
                <p>Ho podràs recuperar amb el següent enllaç: <a href="http://localhost:4200/recuperacio">recuperacio</a></p>
                <p>Dada de enviament del correu: <span id="dataEnviament"></span></p>

                <script>
                    function dataA() {
                        document.getElementById('dataEnviament').innerHTML = new Date().toUTCString();
                    }
                    dataA();
                </script>
            </body>
        </html>`
    };

    await transporter.sendMail(mailOptions, function (error, inf) {
        if (error) {
            console.log(error);
        } else {
            console.log('correu enviat: ' + inf.response);
        }
    });
});

app.get('/usuaris/recuperacio', async (req, res) => {
    let resposta = req.query.usuari

    const document = await dbC.doc(resposta).get();

    const dades = document.data();

    console.log(dades)

    res.json(dades.clauUnica)


})

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
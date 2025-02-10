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

app.get('/usuaris/informaciopersonal/:id/:passwd', async (req, res) => {
    try {
        const { id, passwd } = req.params; // Obtener parámetros de la URL

        const document = await dbC.doc(id).get();

        if (!document.exists) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        const usuariData = document.data();

        if (passwd !== usuariData.contrasena) {
            return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
        }

        const usuari = {
            success: true,
            user: {
                nombre: usuariData.nombre,
                apellido: usuariData.apellido,
                DNI: usuariData.DNI,
                correo: usuariData.correo,
                cumpleanos: usuariData.cumpleanos,
                direccion: usuariData.direccion,
                telefono: usuariData.telefono,
                cesta: usuariData.cesta,
                comandas: usuariData.comandas,

                // ⚠️ Datos sensibles, en producción deberían estar encriptados o no enviarse directamente
                fechaTarjeta: usuariData.fechaTarjeta,
                numeroTarjeta: usuariData.numeroTarjeta,
                titularTarjeta: usuariData.titularTarjeta,
                CVVTarjeta: usuariData.CVVTarjeta
            }
        };

        res.json(usuari);
    } catch (error) {
        console.error("Error en la consulta:", error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});

app.put('/usuaris/push', async (req, res) => {
    try {
        const usuario = req.body;
        const documentid = usuario.usuario; // ID del usuario en Firestore
        console.log(usuario)

        // ✅ Validar si el ID de usuario es válido
        if (!documentid || typeof documentid !== 'string' || documentid.trim() === '') {
            return res.status(400).json({ success: false, message: "ID de usuario no válido" });
        }

        const userRef = dbC.doc(documentid);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            await userRef.set(usuario, { merge: true });
            console.log('✅ Usuario actualizado:', usuario);
            res.json({ success: true, message: "Usuario actualizado correctamente" });
        } else {
            await userRef.set(usuario);
            console.log('✅ Usuario creado:', usuario);
            res.json({ success: true, message: "Usuario creado correctamente" });
        }
    } catch (error) {
        console.error('❌ Error al procesar la solicitud:', error);
        res.status(500).json({ success: false, message: "Error interno del servidor" });
    }
});


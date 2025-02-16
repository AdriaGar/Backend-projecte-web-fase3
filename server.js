const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./KeyFirebase.json');
const nodemailer = require('nodemailer');

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

    if (document.exists) {



    const dades = document.data();
    
    console.log(dades)

    let mailOptions = {
        from: 'BobbyCotxes@cotxesbobby.com',
        to: dades.correo,
        subject: 'Correu recuperació compte de ECommerce Bobby Cotxes',
        html: `<!DOCTYPE html>
<html lang="ca">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Bobby Cotxes: Recuperació de compte</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                background-color: black;
                margin: 0;
                padding: 0;
                color: white;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 30px auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .header h1 {
                color: red;
                font-size: 28px;
                margin: 0;
            }
            .title {
                font-size: 22px;
                color: #2980b9;
                margin-bottom: 15px;
            }
            .content p {
                font-size: 16px;
                line-height: 1.5;
                color: #333;
            }
            .content a {
                color: red;
                text-decoration: none;
                font-weight: bold;
                border: 2px solid red;
                padding: 10px 20px;
                border-radius: 5px;
                display: inline-block;
                margin-top: 15px;
                transition: background-color 0.3s ease;
            }
            .content a:hover {
                background-color: red;
                color: white;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 14px;
                color: #777;
            }
            .footer p {
                margin: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Bobby Cotxes: Recuperació compte</h1>
            </div>

            <div class="content">
                <p>Bon dia, ${dades.nombre},</p>
                <p>Hem rebut una petició per canviar la contrasenya del teu compte d'usuari ${dades.nombre}.</p>
                <p>Per recuperar-ho, fes clic al següent enllaç:</p>
                <p><a href="http://localhost:4200/recuperacio">Recuperació compte</a></p>
                <p><strong>Clau de recuperació:</strong> ${dades.clauUnica}</p>
            </div>

            <div class="footer">
                <p>Data de enviament: <span id="dataEnviament"></span></p>
                <script>
                    window.onload = function() {
                        let data = new Date();
                        let any = data.getFullYear()
                        let mes = data.getMonth() + 1
                        let dia = data.getDate()
                        let hora = data.getHours() % 12
                        let minuts = data.getMinutes()
                        
                        if (hora === 0){
                            hora = 12
                            minuts = minuts + " AM"
                        }
                        
                        if (hora >= 12){
                            minuts = minuts + " PM"
                        }
                        else{
                            minuts = minuts + " AM"    
                        }
                    
                        document.getElementById('dataEnviament').innerHTML = dia + "/" + mes + "/" + any + " " + hora + ":" + minuts
                        document.getElementById('AnyDRETS').innerHTML = any
                    }
                </script>
                <p>&copy; <span id="AnyDRETS"></span> Bobby Cotxes. Tots els drets reservats.</p>
            </div>
        </div>
    </body>
</html>`
            
            
    }


        await transporter.sendMail(mailOptions, function (error, inf) {
            if (error) {
                console.log(error);
            } else {
                console.log('correu enviat: ' + inf.response);
            }
        });
    } else {
        console.log("usuari no existeix")
        return res.status(403).send('Usuari no existeix')
    }
});

app.get('/usuaris/recuperacio', async (req, res) => {
    let resposta = req.query.usuari

    const document = await dbC.doc(resposta).get();

    const dades = document.data();

    console.log(dades)

    res.json(dades.clauUnica)

})

app.post('/usuaris/recuperaciocont', async (req, res) => {
    temp = req.body
    console.log(temp)
    console.log(temp.usuari)
    console.log(temp.contrasena)
    console.log(temp.clauUnica)
    let pujada = await dbC.doc(temp.usuari).update({contrasena: temp.contrasena,clauUnica: temp.clauUnica})
})

app.post('/usuaris/push', async (req, res) => {
    let usuario = req.body;
    let nomDocument = usuario.usuari;
    let dades = usuario.dades;

    if (!nomDocument) {
        return res.status(400).send('ID del usuario no proporcionado');
    }

    try {
        await dbC.doc(nomDocument).set(dades);
        res.send('Usuario agregado correctamente');
    } catch (error) {
        console.error("Error al agregar usuario:", error);
        res.status(500).send('Error al agregar usuario');
    }
});

app.post('/usuaris/mailconfusr', async (req, res) => {
    let usuari = req.body;
    
    console.log(usuari.usuariid)

    const document = await dbC.doc(usuari.usuariid).get();

    const dades = document.data();
    
    console.log(dades)

    let mailOptions = {
        from: 'BobbyCotxes@cotxesbobby.com',
        to: dades.correo,
        subject: 'Correu confirmacio nou compte de ECommerce Bobby Cotxes',
        html: `<!DOCTYPE html>
<html lang="ca">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bobby Cotxes: Confirmar nou compte</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: black;
            margin: 0;
            padding: 0;
            color: white;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 30px auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: red;
            font-size: 28px;
            margin: 0;
        }
        .title {
            font-size: 22px;
            color: #2980b9;
            margin-bottom: 15px;
        }
        .content p {
            font-size: 16px;
            line-height: 1.5;
            color: #333;
        }
        .content a {
            color: red;
            text-decoration: none;
            font-weight: bold;
            border: 2px solid red;
            padding: 10px 20px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 15px;
            transition: background-color 0.3s ease;
        }
        .content a:hover {
            background-color: red;
            color: white;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 14px;
            color: #777;
        }
        .footer p {
            margin: 5px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bobby Cotxes: Confirmar nou compte</h1>
        </div>

        <div class="content">
            <p>Bon dia, ${dades.nombre},</p>
            <p>Benvingut a Bobby Cotxes, ${dades.nombre}!</p>
            <p>Per poder fer servir el teu compte, hauràs de confirmar clicant el següent enllaç:</p>
            <p><a href="http://localhost:4200/confirmacioCompte?usuari=${encodeURIComponent(dades.usuario)}">Confirmar compte</a></p>
        </div>

        <div class="footer">
            <p>Data de enviament: <span id="dataEnviament"></span></p>
            <script>
                window.onload = function() {
                    let data = new Date();
                    let any = data.getFullYear()
                    let mes = data.getMonth() + 1
                    let dia = data.getDate()
                    let hora = data.getHours() % 12
                    let minuts = data.getMinutes()

                    if (hora === 0) {
                        hora = 12
                        minuts = minuts + " AM"
                    }

                    if (hora >= 12) {
                        minuts = minuts + " PM"
                    }
                    else {
                        minuts = minuts + " AM"
                    }

                    document.getElementById('dataEnviament').innerHTML = dia + "/" + mes + "/" + any + " " + hora + ":" + minuts
                    document.getElementById('AnyDRETS').innerHTML = any
                }
            </script>
            <p>&copy; <span id="AnyDRETS"></span> Bobby Cotxes. Tots els drets reservats.</p>
        </div>
    </div>
</body>
</html>
`
    };


    await transporter.sendMail(mailOptions, function (error, inf) {
        if (error) {
            console.log(error);
        } else {
            console.log('correu enviat: ' + inf.response);
        }
    });
});

app.put('/usuaris/confirmarusuari', async (req, res) => {
    temp = req.body
    console.log(temp.usuari)
    let pujada = await dbC.doc(temp.usuari).update({usuariConfirmat: true})
})

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
                clauUnica: usuariData.clauUnica,
                usuariConfirmat: usuariData.usuariConfirmat,
                telefono: usuariData.telefono,
                cesta: usuariData.cesta,
                comandas: usuariData.comandas,

                fechaTarjeta: usuariData.fechaTarjeta,
                numeroTarjeta: usuariData.numeroTarjeta,
                titularTarjeta: usuariData.titularTarjeta,
                CVVTarjeta: usuariData.CVVTarjeta
            }
        };
        console.log(usuari.user.comandas)

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

app.get('/usuari/conicidencies', async (req, res) => {
    let usuari = req.query.usuari
    let con = await dbC.where('usuario', '==', usuari).get()

    if (con.empty) {
        res.json({coin: false})
    } else {
        res.json({coin: true})
    }
});
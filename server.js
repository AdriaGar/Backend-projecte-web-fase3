const express = require('express');
const cors = require('cors');
const Sequelize = require('sequelize')
const admin = require('firebase-admin');
const serviceAccount = require('./KeyFirebase.json');
const nodemailer = require('nodemailer');
const axios = require('axios');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { AzureOpenAI } = require("openai");
const {dadesPerAccedirServidorCorreu} = require('./mail.server.access.data') ;
const port = 3080;

//multer guardar arxius
const storage = multer.diskStorage({
    destination: ".\\..\\P2ProjecteBotigaA2\\public\\images",
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({storage: storage});

//bd relacional (Mysql)
const {crearConfigBaseDades} = require("./db.config");
const db2 = crearConfigBaseDades();
const {initModels} = require('./models/init-models');
const {categoria,cotxe,cotxe_categoria,factura,factura_detall,imatge,oferta} = initModels(db2);
const {dadesPerAccedirBD} = require('./db.acess.data')

//firestone bd no relacional
const app = express();
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const dbC = db.collection('usuaris');


app.use(cors({
    origin: ['http://localhost:4200', 'https://www.carqueryapi.com']
}));

app.use(express.json());

const transporter = dadesPerAccedirServidorCorreu();

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

db2.sync().then(() => {
    console.log("Drop and re-sync db")
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
                esAdmin: usuariData.esAdmin,

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

app.get('/usuari/conicidencies', async (req, res) => {
    let usuari = req.query.usuari
    let con = await dbC.where('usuario', '==', usuari).get()

    if (con.empty) {
        res.json({coin: false})
    } else {
        res.json({coin: true})
    }
});

app.get('/api/cotxes', async (req, res) => {
    let api = await axios.get('https://www.carqueryapi.com/api/0.3/?cmd=getMakes')
    res.json(api.data);
});

app.get('/db/cotxes', async (req, res) => {
    let cotDEF = []

    let cotxesT = await cotxe.findAll({
        include: [
            {
                model: categoria,
                as: 'categorias',
                attributes: ['CATEGORIA_NOM'],
            },
            {
                model: imatge,
                as: 'imatges',
                attributes: ['ID_IMATGE', 'RUTA']
            },
            {
                model: oferta,
                as: 'oferta',
                attributes: ['OFERTA', 'INICIO_OFERTA', 'FINAL_OFERTA']
            }
        ]
    });

    cotxesT.forEach(cotx => {
        let imatgs = [];
        let categ = [];
        let cantidadOferta = 0

        cotx.categorias.forEach(c => {
            categ.push(c.CATEGORIA_NOM);
        });

        cotx.imatges.forEach(imatge => {
            imatgs.push(imatge.RUTA);
        });

        cotx.oferta.forEach(oferta => {
            const inicioOferta = new Date(oferta.INICIO_OFERTA);
            const finalOferta = new Date(oferta.FINAL_OFERTA);
            const fechaActual = new Date();

            if (finalOferta > fechaActual && inicioOferta < fechaActual) {
                cantidadOferta += oferta.OFERTA / 100;
            }
        });


        let cotxA = {
            id: cotx.COTXE_ID,
            name: cotx.COTXE_NOM,
            price: cotx.COTXE_PREU,
            tags: categ,
            offertext: cotx.COTXE_TEXT_OFERTA,
            imgC: imatgs,
            oferta: cantidadOferta
        };

        cotDEF.push(cotxA);
    });


    res.json(cotDEF)
})

app.get('/db/ofertas', async (req, res) => {
    let ofertas = await oferta.findAll();

    res.json(ofertas)
})

app.delete('/db/del/ofertas/:id', async (req, res) => {
    try {
        const id = req.params.id; // Obtener la ID de la URL
        const ofertaEliminada = await oferta.destroy({ where: { id_oferta: id } });

        if (ofertaEliminada) {
            res.json({ success: true, message: `Oferta con ID ${id} eliminada` });
        } else {
            res.json({ success: false, message: 'Oferta no encontrada' });
        }
    } catch (error) {
        console.error('❌ Error al eliminar la oferta:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

app.put('/db/update/ofertas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { ofert, inicio_oferta, final_oferta } = req.body;

        console.log('Parametros recibidos: ', { id, ofert, inicio_oferta, final_oferta });

        const inicioDate = new Date(inicio_oferta);
        const finalDate = new Date(final_oferta);

        console.log('Fechas convertidas: ', { inicioDate, finalDate });

        if (isNaN(inicioDate.getTime()) || isNaN(finalDate.getTime())) {
            return res.json({ success: false, message: 'Fechas inválidas' });
        }

        const ofertaExistente = await oferta.findOne({ where: { id_oferta: id } });

        if (!ofertaExistente) {
            return res.json({ success: false, message: 'Oferta no encontrada' });
        }

        console.log('Oferta encontrada: ', ofertaExistente.oferta);

        let filas = await ofertaExistente.update({
            OFERTA: ofert,
            INICIO_OFERTA: inicioDate,
            FINAL_OFERTA: finalDate
        })

        res.json({ success: true, message: `Oferta con ID ${id} actualizada` });
    } catch (error) {
        console.error('❌ Error al actualizar la oferta:', error);
        res.json({ success: false, message: 'Error interno del servidor' });
    }
});

app.post('/db/insert/ofertas/', async (req, res) => {
    try {
        const { id_coche, ofert, inicio_oferta, final_oferta } = req.body;

        console.log('Datos recibidos para crear oferta:', { id_coche, ofert, inicio_oferta, final_oferta });

        // Validación básica
        if (!id_coche || !ofert || !inicio_oferta || !final_oferta) {
            return res.json({ success: false, message: '⚠️ Faltan campos obligatorios' });
        }

        const inicioDate = new Date(inicio_oferta);
        const finalDate = new Date(final_oferta);

        if (isNaN(inicioDate.getTime()) || isNaN(finalDate.getTime())) {
            return res.json({ success: false, message: '⚠️ Fechas inválidas' });
        }

        // Crear nueva oferta en la base de datos
        const nuevaOferta = await oferta.create({
            ID_COCHE: id_coche,
            OFERTA: ofert,
            INICIO_OFERTA: inicioDate,
            FINAL_OFERTA: finalDate
        });

        console.log('✅ Oferta creada con éxito:', nuevaOferta);

        res.json({ success: true, message: 'Oferta creada correctamente', oferta: nuevaOferta });
    } catch (error) {
        console.error('❌ Error al crear la oferta:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});





app.get('/db/categories', async (req, res) => {
    let categoriestext = []
    
    let categoriesNotext = await categoria.findAll({
        attributes: ['CATEGORIA_NOM']
    })
    
    categoriesNotext.forEach(cat => {
        categoriestext.push(cat.CATEGORIA_NOM)
    })
    
    res.json(categoriestext)
})

/*app.post('/srv/movimentos', async (req, res) => {
    let moviment = req.body.mov
    let usuari = req.body.usr
    let pathMov = path.join('./../public/moviments',usuari)
    let pathDefecte = path.join("C:\\Users\\Usuario\\IdeaProjects\\Backend-projecte-web-fase3\\public\\moviments",usuari)
    let llistaArx = []
    let mesRecent
    let dataActual = new Date()
    let ani = dataActual.getFullYear();
    let mes = dataActual.getMonth() + 1;
    let dia = dataActual.getDate();
    let stringDataActual = dia+"-"+mes+"-"+ani;
    let movimentActualString = "Data: "+dataActual + "\n" + "Moviment: " + moviment

    if (!fs.existsSync("C:\\Users\\Usuario\\IdeaProjects\\Backend-projecte-web-fase3\\public\\moviments")) {
        fs.mkdirSync("C:\\Users\\Usuario\\IdeaProjects\\Backend-projecte-web-fase3\\public\\moviments");
    }

    if (!fs.existsSync(pathMov)){
        fs.mkdirSync(pathMov);
    }
    else{
        llistaArx = fs.readdirSync(pathMov);
        llistaArx.forEach(cat => {
            if (path.extname(cat) === stringDataActual && path.extname(cat) === ".txt") {
                mesRecent = cat;
            }
        })

        if (mesRecent === ""){
            mesRecent = stringDataActual
        }

        pathDefecte = pathDefecte+"\\"+mesRecent+".txt"



        if (!fs.existsSync(pathMov)) {
            fs.writeFileSync(pathMov, movimentActualString);
        }
        else {
            fs.writeFileSync(pathDefecte, "\n"+movimentActualString);
        }
    }
})
*/
app.post('/db/pujaproducte', upload.array('imatges', 3), async (req, res) => {

    try {
        let formulari = req.body;

        let cotxeExistente = await cotxe.findOne({
            where: {
                COTXE_NOM: formulari.nom
            }
        });

        if (cotxeExistente) {
            return res.status(400).json({ estate: 8, message: 'El cotxe ja existeix a la base de dades.' });
        }

        let pujarproducte = await cotxe.create({
            COTXE_NOM: formulari.nom,
            COTXE_PREU: formulari.preu,
            COTXE_TEXT_OFERTA: formulari.textoferta
        });

        let categ = JSON.parse(formulari.categories);

        let categoriesid = await categoria.findAll({
            attributes: ['CATEGORIA_ID', 'CATEGORIA_NOM'],
        });

        for (let cats of categ) {
            let catego = categoriesid.find(c => c.CATEGORIA_NOM === cats);
            await cotxe_categoria.create({ COTXE_ID: pujarproducte.COTXE_ID, CATEGORIA_ID: catego.CATEGORIA_ID });
        }

        if (req.files) {
            let nimat = 1;

            for (let file of req.files) {
                let v = "v" + nimat;
                let ruta = file.path.slice(29);
                let renombrat = path.join('\\images', formulari.nom + v + file.path.slice(file.path.lastIndexOf('.')));
                let rutabd = renombrat.replaceAll('\\', '/');
                await imatge.create({ NUMERO_IMATGE: nimat, RUTA: rutabd, COTXE_ID: pujarproducte.COTXE_ID });
                nimat++;
            }
        }

        res.json({ estate: 6 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ estate: 7, message: 'Error al processar la sol·licitud' });
    }

});

const connection = dadesPerAccedirBD()

app.post('/historial/afegir-factura-detall', (req, res) => {
    const { client_id, data_creacio, total_comanda, moneda, hash_transacio, metode_pagament, cotxes } = req.body;

    const insercio1 = `INSERT INTO factura (client_id, data_creacio, total_comanda, metode_pagament, moneda, hash_transacio) VALUES (?,?,?,?,?,?)`;
    const insercio2 = `INSERT INTO factura_detall (id_factura, id_cotxe, quantitat) VALUES (?,?,?)`;

        connection.execute(insercio1, [client_id, data_creacio, total_comanda, metode_pagament, moneda, hash_transacio], (err, result) => {
        if (err) {
            console.log('Error en inserir factura', err);
            return res.status(500).json({ error: 'Error en inserir factura', detalls: err });
        }
        const factura_id = result.insertId;
        console.log('Factura inserida correctament', result);

        cotxes.forEach((cotxe) => {
            connection.execute(insercio2, [factura_id, cotxe.id_cotxe, cotxe.quantitat], (err, result) => {
                if (err) {
                    console.log('Error en inserir factura detalls:', err);
                }
                console.log('Detalls factura inserit correctament', result);
            });
        });
        res.status(200).json({ missatge: 'Factura i detalls inserits correctament' });
    });
});
app.get('/obtenir-historial', async (req, res) => {
    try {
        const historialResult = await connection.promise().query(`
            SELECT 
                f.FACTURA_ID,
                f.CLIENT_ID AS CLIENT_NOM,
                f.DATA_CREACIO,
                c.COTXE_NOM,
                fd.QUANTITAT,
                f.MONEDA,
                f.HASH_TRANSACIO,
                CASE 
                    WHEN o.ID_COCHE IS NOT NULL THEN 'Sí' 
                    ELSE 'No' 
                END AS EN_OFERTA
            FROM factura_detall fd
            JOIN factura f ON fd.ID_FACTURA = f.FACTURA_ID
            JOIN cotxe c ON fd.ID_COTXE = c.COTXE_ID
            LEFT JOIN oferta o ON c.COTXE_ID = o.ID_COCHE
                AND f.DATA_CREACIO BETWEEN o.INICIO_OFERTA AND o.FINAL_OFERTA
            ORDER BY f.DATA_CREACIO DESC
        `);

        const historialRows = historialResult[0];

        console.log('Historial de compres:', historialRows);

        res.status(200).json({
            historial: historialRows
        });
    } catch (err) {
        console.error("Error en consultar l'historial de productes:", err);
        res.status(500).json({ error: "Error en consultar les dades", detalls: err });
    }
});





app.post('/srv/enviarformularisadisfacio',(req,res) => {
    let resultat = req.body

    let text1 = '----------Dades del client----------' + '\n'
    let client = 'usuari: ' + resultat.usuari + '\n'
    let nom = 'nom: ' + resultat.nom + '\n'
    let cognom = 'cognom: ' + resultat.cognom + '\n'
    let correu = 'correu: ' + resultat.correu + '\n'
    let telefon = 'telefon: ' + resultat.telefon + '\n'
    let temps = 'TEMPS DINS DEL FORMULARI: ' + resultat.tempsDins + '\n'
    let text2 = '---------Resultat FORMULARI----------' + '\n'
    let sadisfacioAmbElProducte = 'sadisfacio amb el producte: ' + resultat.grauSadisfacio + '\n'
    let serveiAlClient = 'servei al client: ' + resultat.grauSadisfacioServei + '\n'
    let recomenacio = 'Recomendacio de l empresa: ' + resultat.notaRecomenacio + '\n'
    let comenatariPersonal = 'Comentari personal: ' + resultat.comentari

    let enquesta = text1 + client + nom + cognom + correu + telefon + temps + text2 + sadisfacioAmbElProducte + serveiAlClient + recomenacio + comenatariPersonal

    let rutaUsuari = 'C:\\Users\\Usuario\\IdeaProjects\\Backend-projecte-web-fase3\\public\\enquestes\\' + resultat.usuari
    let rutaArxiu = rutaUsuari + '\\' + Date.now() + '.txt'

    if (fs.existsSync(rutaUsuari)){
       fs.writeFile(rutaArxiu,enquesta,(err)=>{
           if (err){
               throw err
               res.send(false)
           }
           else{
               res.send(true)
           }
       })
    }
    else{
        fs.mkdirSync(rutaUsuari);
        fs.writeFile(rutaArxiu,enquesta,(err)=>{
            if (err){
                throw err
                res.send(false)
            }
             else{
                res.send(true)
            }
        })
    }

})

app.get('/db/existeixcotxe', async (req,res) => {

    let cot = req.query.nomCotx

    let resultat = await cotxe.findOne({
        where:{
            COTXE_NOM:cot
        }
    })

    if (resultat > 1){
        res.send(true)
    }
    else{
        res.send(false)
    }

})

const apiKey = "CuswKJVp7YU0oSVpuYUS78WjCyUqBjQNsWddFCqV0RgSeJK5owppJQQJ99BEACHYHv6XJ3w3AAAAACOGom3S";
const apiVersion = "2024-04-01-preview";
const endpoint = "https://david-maqky7wn-eastus2.cognitiveservices.azure.com/";
const modelName = "gpt-4.1";
const deployment = "gpt-4.1";
const options = { endpoint, apiKey, deployment, apiVersion }

const client = new AzureOpenAI(options);


let bobbyInfo = "";

async function carregarBobbyInfo() {
    bobbyInfo = await fs.readFile('public/bobby_cotxes_info.txt', 'utf8');
}

carregarBobbyInfo();




app.post('/chat', async (req, res) => {
    try {
        const { pregunta } = req.body;
        if (!pregunta) return res.status(400).json({ error: "Falta la pregunta" });

        const [rows] = await connection.promise().query('SELECT * FROM cotxe');
        let cotxesInfo = rows.map(row => JSON.stringify(row)).join('\n');

        const systemMessage = `Ets un assistent d'una botiga de cotxes BobbyCotxes. Aquesta és la informació de la botiga i dels cotxes: \n\n${bobbyInfo}\n\n${cotxesInfo}\n\nRespon a la pregunta de l'usuari segons aquesta informació.`;

        const messages = [
            { role: "system", content: systemMessage },
            { role: "user", content: pregunta }
        ];

        const response = await client.chat.completions.create({
            model: deployment,
            messages,
            max_completion_tokens: 800,
            temperature: 1,
        });

        const resposta = response.choices[0].message.content;
        res.json({ resposta });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message || 'Error del servidor' });
    }
});
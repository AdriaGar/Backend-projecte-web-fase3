const express = require('express');
const cors = require('cors');


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



const mysql = require('mysql2')

const dadesPerAccedirBD = () => {
    return mysql.createConnection({
        host: 'localhost',
        user: 'BOBBYSERVER',
        password: 'BO!Rz-e#l_Ns-&^uPzyMC(BBY',
        database: 'BOBBYCOTXES'
    });
}
module.exports = {dadesPerAccedirBD}

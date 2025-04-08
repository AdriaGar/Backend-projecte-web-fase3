const Sequelize = require("sequelize");

const crearConfigBaseDades = () => {
    return new Sequelize("BOBBYCOTXES","BOBBYSERVER","BO!Rz-e#l_Ns-&^uPzyMC(BBY",{
        host:"localhost",
        dialect:"mysql",
        pool: {
            max: 5,
            min: 0,
            acquire: 3000,
            idle: 10000
        }
    });
}
module.exports = {crearConfigBaseDades}

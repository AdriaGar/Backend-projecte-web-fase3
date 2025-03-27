var DataTypes = require("sequelize").DataTypes;
var _categoria = require("./categoria");
var _cotxe = require("./cotxe");
var _cotxe_categoria = require("./cotxe_categoria");
var _factura = require("./factura");
var _factura_detall = require("./factura_detall");
var _imatge = require("./imatge");
var _oferta = require("./oferta");

function initModels(sequelize) {
  var categoria = _categoria(sequelize, DataTypes);
  var cotxe = _cotxe(sequelize, DataTypes);
  var cotxe_categoria = _cotxe_categoria(sequelize, DataTypes);
  var factura = _factura(sequelize, DataTypes);
  var factura_detall = _factura_detall(sequelize, DataTypes);
  var imatge = _imatge(sequelize, DataTypes);
  var oferta = _oferta(sequelize, DataTypes);

  cotxe.belongsToMany(categoria, {
    through: 'cotxe_categoria',
    foreignKey: 'COTXE_ID',
    as: 'categorias'
  });
  categoria.belongsToMany(cotxe, {
    through: 'cotxe_categoria',
    foreignKey: 'CATEGORIA_ID',
    as: 'cotxes'
  });
  cotxe.hasMany(factura_detall, { as: 'factura_detalls', foreignKey: 'ID_COTXE' });
  factura_detall.belongsTo(cotxe, { as: 'ID_COTXE_cotxe', foreignKey: 'ID_COTXE' });
  cotxe.hasMany(imatge, { as: 'imatges', foreignKey: 'COTXE_ID' });
  imatge.belongsTo(cotxe, { as: 'COTXE', foreignKey: 'COTXE_ID' });
  factura.hasMany(factura_detall, { as: 'factura_detalls', foreignKey: 'ID_FACTURA' });
  factura_detall.belongsTo(factura, { as: 'ID_FACTURA_factura', foreignKey: 'ID_FACTURA' });
  oferta.belongsTo(cotxe, { as: "ID_COCHE_cotxe", foreignKey: "ID_COCHE"});
  cotxe.hasMany(oferta, { as: "oferta", foreignKey: "ID_COCHE"});


  return {
    categoria,
    cotxe,
    cotxe_categoria,
    factura,
    factura_detall,
    imatge,
    oferta,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

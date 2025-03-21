var DataTypes = require("sequelize").DataTypes;
var _categoria = require("./categoria");
var _cotxe = require("./cotxe");
var _cotxe_categoria = require("./cotxe_categoria");
var _factura = require("./factura");
var _factura_detall = require("./factura_detall");
var _imatge = require("./imatge");

function initModels(sequelize) {
  var categoria = _categoria(sequelize, DataTypes);
  var cotxe = _cotxe(sequelize, DataTypes);
  var cotxe_categoria = _cotxe_categoria(sequelize, DataTypes);
  var factura = _factura(sequelize, DataTypes);
  var factura_detall = _factura_detall(sequelize, DataTypes);
  var imatge = _imatge(sequelize, DataTypes);

  cotxe_categoria.belongsTo(categoria, { as: "CATEGORIum", foreignKey: "CATEGORIA_ID"});
  categoria.hasMany(cotxe_categoria, { as: "cotxe_categoria", foreignKey: "CATEGORIA_ID"});
  cotxe_categoria.belongsTo(cotxe, { as: "COTXE", foreignKey: "COTXE_ID"});
  cotxe.hasMany(cotxe_categoria, { as: "cotxe_categoria", foreignKey: "COTXE_ID"});
  factura_detall.belongsTo(cotxe, { as: "ID_COTXE_cotxe", foreignKey: "ID_COTXE"});
  cotxe.hasMany(factura_detall, { as: "factura_detalls", foreignKey: "ID_COTXE"});
  imatge.belongsTo(cotxe, { as: "COTXE", foreignKey: "COTXE_ID"});
  cotxe.hasMany(imatge, { as: "imatges", foreignKey: "COTXE_ID"});
  factura_detall.belongsTo(factura, { as: "ID_FACTURA_factura", foreignKey: "ID_FACTURA"});
  factura.hasMany(factura_detall, { as: "factura_detalls", foreignKey: "ID_FACTURA"});

  return {
    categoria,
    cotxe,
    cotxe_categoria,
    factura,
    factura_detall,
    imatge,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;

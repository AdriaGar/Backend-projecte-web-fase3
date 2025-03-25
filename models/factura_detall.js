const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('factura_detall', {
    ID_FACTURA_DETALL: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ID_FACTURA: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'factura',
        key: 'FACTURA_ID'
      }
    },
    ID_COTXE: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cotxe',
        key: 'COTXE_ID'
      }
    },
    QUANTITAT: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'factura_detall',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID_FACTURA_DETALL" },
        ]
      },
      {
        name: "FK_FACTURA_DETALL_FACTURA_ID",
        using: "BTREE",
        fields: [
          { name: "ID_FACTURA" },
        ]
      },
      {
        name: "FK_FACTURA_DETALL_COTXE_ID",
        using: "BTREE",
        fields: [
          { name: "ID_COTXE" },
        ]
      },
    ]
  });
};

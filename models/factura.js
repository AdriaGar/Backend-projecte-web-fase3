const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('factura', {
    FACTURA_ID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CLIENT_ID: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    DATA_CREACIO: {
      type: DataTypes.DATE,
      allowNull: true
    },
    TOTAL_COMANDA: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    METODE_PAGAMENT: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    MONEDA: {
      type: DataTypes.STRING(25),
      allowNull: true
    },
    HASH_TRANSACIO: {
      type: DataTypes.STRING(70),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'factura',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "FACTURA_ID" },
        ]
      },
    ]
  });
};

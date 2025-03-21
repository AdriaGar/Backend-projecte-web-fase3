const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('imatge', {
    ID_IMATGE: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    NUMERO_IMATGE: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    RUTA: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    COTXE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cotxe',
        key: 'COTXE_ID'
      }
    }
  }, {
    sequelize,
    tableName: 'imatge',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID_IMATGE" },
        ]
      },
      {
        name: "FK_IMATGE_COTXE_ID",
        using: "BTREE",
        fields: [
          { name: "COTXE_ID" },
        ]
      },
    ]
  });
};

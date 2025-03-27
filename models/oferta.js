const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('oferta', {
    ID_OFERTA: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ID_COCHE: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cotxe',
        key: 'COTXE_ID'
      }
    },
    OFERTA: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'oferta',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ID_OFERTA" },
        ]
      },
      {
        name: "COTCHE_ID_idx",
        using: "BTREE",
        fields: [
          { name: "ID_COCHE" },
        ]
      },
    ]
  });
};

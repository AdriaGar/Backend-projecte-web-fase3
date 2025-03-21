const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cotxe', {
    COTXE_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    COTXE_NOM: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    COTXE_PREU: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    COTXE_TEXT_OFERTA: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cotxe',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "COTXE_ID" },
        ]
      },
    ]
  });
};

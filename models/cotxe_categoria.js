const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cotxe_categoria', {
    COTXE_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cotxe',
        key: 'COTXE_ID'
      }
    },
    CATEGORIA_ID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categoria',
        key: 'CATEGORIA_ID'
      }
    }
  }, {
    sequelize,
    tableName: 'cotxe_categoria',
    timestamps: false,
    indexes: [
      {
        name: "FK_COTXE_CATEGORIA_COTXE_ID",
        using: "BTREE",
        fields: [
          { name: "COTXE_ID" },
        ]
      },
      {
        name: "FK_COTXE_CATEGORIA_CATEGORIA_ID",
        using: "BTREE",
        fields: [
          { name: "CATEGORIA_ID" },
        ]
      },
    ]
  });
};

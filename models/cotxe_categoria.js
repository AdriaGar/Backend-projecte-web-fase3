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
    indexes: []
  });
};

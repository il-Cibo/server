'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RecipeTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  RecipeTag.init({
    RecipeId: {
      type: DataTypes.INTEGER,
    },
    TagId: {
      type: DataTypes.INTEGER
    }
  }, {
    sequelize,
    modelName: 'RecipeTag',
  });
  return RecipeTag;
};
'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRecipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserRecipe.init({
    UserId: DataTypes.INTEGER,
    RecipeId: DataTypes.INTEGER,
    favorites: DataTypes.BOOLEAN,
    plan: DataTypes.ARRAY(DataTypes.DATEONLY)
  }, {
    sequelize,
    modelName: 'UserRecipe',
  });
  return UserRecipe;
};
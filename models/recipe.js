'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Recipe.belongsToMany(models.User, { through: models.UserRecipe });
      Recipe.belongsToMany(models.Tag, { through: models.RecipeTag });
    }
  };
  Recipe.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'title is required'
        },
        isAlpha: {
          ags: true,
          msg: 'title cannot contain number'
        }
      }
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'description is required'
        }
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: {
          args: true,
          msg: 'image only allow url'
        },
        notEmpty: {
          args: true,
          msg: 'image is required'
        }
      }
    },
    ingredients: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'ingredients is required'
        }
      }
    },
    step: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'step is required'
        }
      }
    },
    serving: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'serving is required'
        },
        isNumeric: {
          args: true,
          msg: 'serving only allow number'
        },
        min: {
          args: 1,
          msg: 'cannot serve less than 1'
        }
      }
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: 'time is required'
        },
        isNumeric: {
          args: true,
          msg: 'time only allow number'
        },
        min: {
          args: 1,
          msg: 'cannot input time less than 1'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Recipe',
  });
  return Recipe;
};
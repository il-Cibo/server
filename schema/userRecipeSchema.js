const { Recipe, UserRecipe, sequelize, Tag, User } = require('../models');
const { gql, AuthenticationError } = require('apollo-server');
const { Op } = require('sequelize');

const typeDefs = gql`
  type UserRecipe {
    UserId: Int,
    RecipeId: Int,
    favorites: Boolean,
    plan: [String]
  }

  extend type Query {
    findFav: UserData
    findPlan: UserData 
  }

  extend type Mutation {
    addFav(id: Int!): UserRecipe
    deleteFav(id: Int!): UserRecipe
    addToPlan(id: Int!, plan: String!): UserRecipe
    removePlan(id: Int!, plan: String!): UserRecipe
  }

`

const resolvers = {
  Query: {
    findFav: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const result = User.findByPk(user.id, {
        include: {
          model: Recipe,
          through: {
            model: UserRecipe,
            where: {
              favorites: true
            }
          },
          include: Tag
        }
      })

      return result;
    },
    findPlan: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const result = User.findByPk(user.id, {
        include: {
          model: Recipe,
          through: {
            model: UserRecipe,
            where: [
              sequelize.where(sequelize.fn('array_length', sequelize.col('plan'), 1), { [Op.ne]: 0 })
            ]
          }
        }
      });

      return result;
    }
  },
  Mutation: {
    addFav: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const { id: RecipeId } = args;

      let [recipe, created] = await UserRecipe.findOrCreate({
        where: {
          UserId: user.id,
          RecipeId
        }, defaults: {
          favorites: true
        }
      })

      if (!created) {
        recipe = await UserRecipe.update({ favorites: true }, {
          where: { UserId: user.id, RecipeId }, returning: true
        })

        return recipe[1][0]
      }
      return recipe;
    },

    deleteFav: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const { id: RecipeId } = args;

      const recipe = await UserRecipe.update({
        favorites: false
      }, {
        where: {
          RecipeId,
          UserId: user.id
        }, returning: true
      });

      return recipe[1][0];
    },

    addToPlan: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const { id: RecipeId, plan } = args;

      let [result, created] = await UserRecipe.findOrCreate({
        where: {
          UserId: user.id,
          RecipeId
        }, defaults: {
          plan: [plan]
        }
      })

      if (!created) {
        result = await UserRecipe.update({ plan: sequelize.fn('array_append', sequelize.col('plan'), plan) }, {
          where: { UserId: user.id, RecipeId }, returning: true
        })
        return result[1][0]
      }

      return result;
    },

    removePlan: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const { id: RecipeId, plan } = args;

      const recipe = await UserRecipe.update({
        plan: sequelize.fn('array_remove', sequelize.col('plan'), plan)
      }, {
        where: {
          RecipeId,
          UserId: user.id
        }, returning: true
      });

      return recipe[1][0];
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
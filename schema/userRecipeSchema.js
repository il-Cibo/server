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
    findFav: User
    findPlan: User 
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

      const [recipe] = await UserRecipe.upsert({
        RecipeId,
        UserId: user.id,
        favorites: true
      });

      return recipe;

    },

    deleteFav: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const { id: RecipeId } = args;

      const [recipe] = await UserRecipe.upsert({
        RecipeId,
        UserId: user.id,
        favorites: false
      });

      return recipe;
    },

    addToPlan: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const { id: RecipeId, plan } = args;

      const [result] = await UserRecipe.upsert({
        RecipeId,
        UserId: user.id,
        plan: sequelize.fn('array_append', sequelize.col('plan') ? sequelize.col('plan') : [], plan)
      })

      return result;
    },

    removePlan: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;
      const { plan } = args;

      const result = await UserRecipe.update({
        plan: sequelize.fn('array_remove', sequelize.col('plan'), plan)
      }, {
        where: {
          RecipeId,
          UserId: user.id
        },
        returning: true
      });

      return result[1][0];
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
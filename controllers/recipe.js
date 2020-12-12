const { Recipe, UserRecipe, Tag } = require('../models/')
const { gql } = require('apollo-server')


const typeDefs = gql`
    type Recipe {
      id: Int
      title: String
      description: String
      image: String
      ingredients: [String]
      step: [String]
      serving: Int
      time: Int
      creation: Boolean
    }
    type Response {
      message: String
    }
    input NewRecipe {
      title: String!
      description: String!
      image: String!
      ingredients: [String!]
      step: [String!]
      serving: Int!
      time: Int!
      creation: Boolean!
    }
    extend type Query {
      recipe(id: Int!): Recipe
      recipes: [Recipe]
    }
    extend type Mutation {
      addRecipe(recipe: NewRecipe): Recipe
      editRecipe(id: Int! recipe: NewRecipe): Recipe
      deleteRecipe(id: Int!): Response
    }`


const resolvers = {
  Query: {
    recipe: async (_, args) => {
      try {
        const data = await Recipe.findOne({ where: { UserId: args.id }, include: { model: Tag } })
        return data
      } catch (error) {
        console.log(error)
      }
    },
    recipes: async () => {
      try {
        const data = await Recipe.findAll({ include: { model: Tag } })
        return data
      } catch (error) {
        console.log(error)
      }
    }
  },
  Mutation: {
    addRecipe: async (_, args) => {
      try {
        // if (!context.user) throw new AuthenticationError("Please login first");
        const { id } = context.user;
        const data = await Recipe.create(args.recipe);
        const dataUserRecipe = {
          UserId: id,
          RecipeId: data.id,
          favorites: false,
          plan: []
        };
        const userRecipe = await UserRecipe.create(dataUserRecipe);
        const { tags } = args;
        for (tag in tags) {
          let newTag = await Tag.findOrCreate({
            where: {
              name: tag.trim().toLowerCase()
            }
          });
          let newPayload = {
            RecipeId: data.id,
            TagId: newTag[0].id
          };
          await RecipeTag.create(newPayload);
        }
        const result = await Recipe.findByPk(data.id, {
          include: Tag
        })
        return result;
      } catch (error) {
        console.log(error)
      }
    },
    editRecipe: async (_, args) => {
      try {
        // if (!context.user) throw new AuthenticationError("Please login first");
        const data = await Recipe.update(args.recipe, {
          where: { id: args.id },
          returning: true
        });
        const { tags } = args;
        for (tag in tags) {
          let newTag = await Tag.findOrCreate({
            where: {
              name: tag.trim().toLowerCase()
            }
          });
          let newPayload = {
            RecipeId: data.id,
            TagId: newTag[0].id
          };
          await RecipeTag.findOrCreate({
            where: newPayload
          });
        }
        return data[1][0].dataValues;
      } catch (error) {
        console.log(error)
      }
    },
    deleteRecipe: async (_, args) => {
      try {
        // if (!context.user) throw new AuthenticationError("Please login first");
        await Recipe.destroy({ where: { id: args.id } });
        return { message: "Recipe has been deleted" };
      } catch (error) {
        console.log(error)
      }
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
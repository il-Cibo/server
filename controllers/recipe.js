const { Recipe } = require('../models/')
const { gql } = require('apollo-server')

class RecipeController {

  static typeDefs = gql`
    type Recipe {
      id: Int
      title: String
      description: String
      image: String
      ingredients: [String]
      step: [String]
      serving: Int
      time: Int
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


  static resolvers = {
    Query: {
      recipe: async (_, args) => {
        try {
          const data = await Recipe.findOne({ where: { id: args.id } })
          return data
        } catch (error) {
          console.log(error)
        }
      },
      recipes: async () => {
        try {
          const data = await Recipe.findAll()
          return data
        } catch (error) {
          console.log(error)
        }
      }
    },
    Mutation: {
      addRecipe: async (_, args) => {
        try {
          const data = await Recipe.create(args.recipe)
          return data
        } catch (error) {
          console.log(error)
        }
      },
      editRecipe: async (_, args) => {
        try {
          const data = await Recipe.update(args.recipe, { where: { id: args.id }, returning: true })
          return data[1][0].dataValues
        } catch (error) {
          console.log(error)
        }
      },
      deleteRecipe: async (_, args) => {
        try {
          await Recipe.destroy({ where: { id: args.id } })
          return { message: 'Recipe has been deleted' }
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
}

module.exports = RecipeController
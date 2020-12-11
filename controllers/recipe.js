const { Recipe } = require('../models/')
const { gql } = require('apollo-server')


class RecipeController {

  static typeDefs = gql`
    type Recipe {
      title: String
      description: String
      image: String
      ingredients: [String]
      step: [String]
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
    }
    extend type Query {
      recipe(id: ID): Recipe
      recipes: [Recipe]
    }
    extend type Mutation {
      addRecipe(recipe: NewRecipe): Recipe
      editRecipe(recipe: NewRecipe): Recipe
      deleteRecipe(id: ID!): Response
    }`


  static resolvers = {
    Query: {
      recipe: async (_, args) => {
        try {
          const data = await Recipe.findOne({ where: { id: args.id } })
          console.log(data)
        } catch (error) {
          console.log(error)
        }
      },
      recipes: async () => {
        try {
          const data = await Recipe.find()
          return data
        } catch (error) {
          console.log(error)
        }
      }
    },
    Mutation: {
      addRecipe: async (_, args) => {
        try {

        } catch (error) {

        }
      },
      editRecipe: async (_, args) => {
        try {

        } catch (error) {

        }
      },
      deleteRecipe: async (_, args) => {
        try {

        } catch (error) {

        }
      }
    }
  }
}

module.exports = RecipeController
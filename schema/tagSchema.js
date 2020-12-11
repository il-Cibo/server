const { gql } = require('apollo-server');
const TagController = require('../controllers/tag');

const typeDefs = gql`

  type Tag {
    name: String
  }

  type TagData {
    name: String
    Recipes: [Recipe]
  }

  extend type Query {
    tag(id: Int): TagData
  }

  extend type Mutation {
    addTag(name: String!): Tag
  }

`

const resolvers = {
  Query: {
    tag: async (_, args) => {
      return await TagController.find(args.id);
    }
  },
  
  Mutations: {
    addTag: async (_, args) => {
      return await TagController.create(args.name);
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
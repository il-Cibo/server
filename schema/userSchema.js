const { gql } = require('apollo-server');
const UserController = require('../controllers/user');

const typeDefs = gql`
  input Register {
    username: String
    email: String
    password: String
    gender: String
    name: String
    avatar: String
  }

  input Login {
    username: String
    password: String
  }

  type User {
    username: String
    email: String
    gender: String
    name: String
    avatar: String
  }

  type UserData {
    username: String
    email: String
    gender: String
    name: String
    avatar: String
    Recipes: [Recipe]
  }

  type Token {
    token: String
  }

  extend type Query {
    login(user: Login): Token
    user: UserData 
  }

  extend type Mutation {
    register(user: Register): User
  }
`

const resolvers = {
  Query = {
    login: async (_, args) => {
      const { user } = args; 
      return await UserController.login(user);
    },
    user: async (_, context) => {
      const { user } = context;
      return await UserController.find(user.id);
    }
  },

  Mutation = {
    register: async (_, args) => {
      const { user } = args;
      return await UserController.register(user);
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
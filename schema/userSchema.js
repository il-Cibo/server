const { gql, AuthenticationError } = require('apollo-server');
const { Bcrypt, JSONWebToken } = require('../helpers');
const { User, Recipe, Tag } = require('../models');

const typeDefs = gql`
  input Register {
    username: String!
    email: String!
    password: String!
    gender: String!
    name: String!
    avatar: String!
  }

  input Login {
    username: String!
    password: String!
  }

  type User {
    username: String
    email: String
    gender: String
    name: String
    avatar: String
  }

  type UserData {
    id: Int
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
    login(user: Login!): Token
    user: UserData 
  }

  extend type Mutation {
    register(user: Register!): User
  }
`

const resolvers = {
  Query: {
    login: async (_, args) => {
      const { user: userPayload } = args;
      const { username, password } = userPayload;

      const user = await User.findOne({
        where: {
          username
        }
      });

      if (!user) throw new AuthenticationError('Invalid email or password');

      if (!Bcrypt.comparePassword(password, user.password)) throw new AuthenticationError('Invalid email or password');

      const tokenPayload = {
        id: user.id,
        username: user.username
      }
      const token = JSONWebToken.signToken(tokenPayload);

      return { token };
    },
    user: async (parent, args, context) => {
      if (!context.user) throw new AuthenticationError('Please login first');
      const { user } = context;
      return await User.findByPk(user.id, {
        include: {
          model: Recipe,
          include: Tag
        }
      });
    }
  },

  Mutation: {
    register: async (_, args) => {
      const { user: payload } = args;
      const newUser = await User.create(payload);
      return newUser;
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
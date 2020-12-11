const { ApolloServer, gql } = require('apollo-server')

const typeDefs = gql`
  type User {
    username: String
    email: String
    password: String
    gender: String
    name: String
    avatar: String
  }
  type Recipe {
    title: String
    description: String
    image: String
    ingredients: [String]
    step: [String]
  }
  type Tag {
    name: String
  }
  type Response {
    message: String
  }
  input NewUser {
    username: String!
    email: String!
    password: String!
    gender: String!
    name: String!
    avatar: String!
  }
  input NewRecipe {
    title: String!
    description: String!
    image: String!
    ingredients: [String!]
    step: [String!]
  }
  type Query {
    login: User
    users: [User]
    recipe: Recipe
    recipes: [Recipe]
    tag: Tag
  }
  type Mutation {
    register(user: NewUser): User
    editUser(user: NewUser): User
    deleteUser(id: ID!): Response

    addRecipe(recipe: NewRecipe): Recipe
    editRecipe(recipe: NewRecipe): Recipe
    deleteRecipe(id: ID!): Response

    addTag(tag: String): Tag
    deleteTag(id: ID!): Response
  }
`

const resolvers = {
  Query: {
    login: async () => {

    },
    users: async () => {

    },
    recipe: async () => {

    },
    recipes: async () => {

    },
    tag: async () => {

    }
  },
  Mutation: {
    register: async (_, args) => {

    },
    editUser: async (_, args) => {

    },
    deleteUser: async (_, args) => {

    },
    addRecipe: async (_, args) => {

    },
    editRecipe: async (_, args) => {

    },
    deleteRecipe: async (_, args) => {

    },
    addTag: async (_, args) => {

    },
    deleteTag: async (_, args) => {

    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
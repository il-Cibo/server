require('dotenv').config()

const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server')
const { RecipeController } = require('./controllers')

const typeDefs = gql`
  type Query
  type Mutation
`

const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
    RecipeController.typeDefs
  ],
  resolvers: [
    RecipeController.resolvers
  ]
})

const server = new ApolloServer({
  schema
});

if (process.env.NODE_ENV !== 'test') {
  server.listen().then(() => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

module.exports = server
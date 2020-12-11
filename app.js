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

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
const { ApolloServer, gql, makeExecutableSchema } = require('apollo-server')

const typeDefs = gql`
  type Query
  type Mutation
`

const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
  ],
  resolvers: [
  ]
})

const server = new ApolloServer({
  schema
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
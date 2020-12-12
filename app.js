const { ApolloServer, gql, makeExecutableSchema, AuthenticationError } = require('apollo-server');
const UserController = require('./controllers/user');
const JSONWebToken = require('./helpers/jwt');
const userSchema = require('./schema/userSchema');

const typeDefs = gql`
  type Query
  type Mutation
`

const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
    userSchema.typeDefs
  ],
  resolvers: [
    userSchema.resolvers
  ]
})

const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
      // ! get the user token from the headers
      const token = req.headers.token || '';

      const decoded = JSONWebToken.verifyToken(token);
  
      if (!decoded) throw new AuthenticationError('You must login first');
      
      // ! try to retrieve a user with the token
      const user = await UserController.find(decoded.id);

      if (!user) throw new AuthenticationError('You must login first');
      
      // ! add the user to the context
      return { user };
    }
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
require('dotenv').config()
const { ApolloServer, gql, makeExecutableSchema, AuthenticationError, GraphQLUpload } = require('apollo-server');
const { JSONWebToken } = require('./helpers');
const { User, Recipe, Tag } = require('./models');
const appSchema = require('./schema');


const typeDefs = gql`
  type Query
  type Mutation
  scalar Upload
`

const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
    ...appSchema.typeDefs
  ],
  resolvers: [
    { Upload: GraphQLUpload },
    ...appSchema.resolvers
  ]
})

const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    // ! get the user token from the headers
    const token = req.headers.token || '';

    if (!token) return {
      user: null
    }

    const decoded = JSONWebToken.verifyToken(token);

    if (!decoded) throw new AuthenticationError('Invalid username or password');

    // ! try to retrieve a user with the token
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Recipe,
        include: Tag
      }
    });

    if (!user) throw new AuthenticationError('Invalid username or password');

    // ! add the user to the context
    return { user };
  }
});

const serverTest = (token) => new ApolloServer({
  schema,
  context: async () => {
    if (!token) return { user: null }
    const decoded = JSONWebToken.verifyToken(token);
    if (!decoded) throw new AuthenticationError('Invalid username or password');
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Recipe,
        include: Tag
      }
    });
    if (!user) throw new AuthenticationError('Invalid username or password');
    return { user };
  }
});

if (process.env.NODE_ENV !== 'test') {
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
}

module.exports = {
  server,
  serverTest
}
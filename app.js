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

const server = (token) => new ApolloServer({
  schema,
  context: async (payload) => {

    const data = { user: null }
    // ! get the user token from the headers

    if (process.env.NODE_ENV === 'test') {
      payload = {
        req: {
          headers: {
            token: token || ''
          }
        }
      }
    }

    if (!payload) return data;

    const { req } = payload;
    token = req.headers.token || '';

    if (!token) return data;

    const decoded = JSONWebToken.verifyToken(token);

    if (!decoded) return data;

    // ! try to retrieve a user with the token
    const user = await User.findByPk(decoded.id, {
      include: {
        model: Recipe,
        include: Tag
      }
    });

    if (!user) return data;

    data.user = user;
    // ! add the user to the context
    return data;
  },
  introspection: true,
  playground: true
});

if (process.env.NODE_ENV !== 'test') {
  server().listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
}

module.exports = {
  server
}
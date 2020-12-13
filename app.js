require('dotenv').config()
const { ApolloServer, gql, makeExecutableSchema, AuthenticationError, GraphQLUpload } = require('apollo-server');
const UserController = require('./controllers/user');
const JSONWebToken = require('./helpers/jwt');
const userSchema = require('./schema/userSchema');
const userRecipeSchema = require('./schema/userRecipeSchema');
const { RecipeController } = require('./controllers')

const typeDefs = gql`
  type Query
  type Mutation
  scalar Upload
`

const schema = makeExecutableSchema({
  typeDefs: [
    typeDefs,
    RecipeController.typeDefs,
    userSchema.typeDefs,
    userRecipeSchema.typeDefs
  ],
  resolvers: [
    { Upload: GraphQLUpload },
    RecipeController.resolvers,
    userSchema.resolvers,
    userRecipeSchema.resolvers
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
    const user = await UserController.find(decoded.id);

    if (!user) throw new AuthenticationError('Invalid username or password');

    // ! add the user to the context
    return { user };
  }
});

// if (process.env.NODE_ENV !== 'test') {
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
// }

module.exports = server
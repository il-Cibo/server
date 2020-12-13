const userSchema = require('./userSchema');
const recipeSchema = require('./recipeSchema');
const userRecipeSchema = require('./userRecipeSchema');

module.exports = {
  typeDefs: [
    userSchema.typeDefs,
    recipeSchema.typeDefs,
    userRecipeSchema.typeDefs
  ],
  resolvers: [
    userSchema.resolvers,
    recipeSchema.resolvers,
    userRecipeSchema.resolvers
  ]
}
const { Recipe, UserRecipe, Tag, RecipeTag } = require('../models');
const { Op } = require('sequelize');
const { gql, ForbiddenError, AuthenticationError } = require('apollo-server');
const { extname } = require('path');
const { v4: uuid } = require('uuid');
const s3 = require('../config/aws');


const typeDefs = gql`
    type Tag {
      name: String
    }

    type Recipe {
      id: Int
      title: String
      description: String
      image: String
      ingredients: [String]
      step: [String]
      serving: Int
      time: Int
      Tags: [Tag]
    }

    type Response {
      message: String
    }

    input NewRecipe {
      title: String!
      description: String!
      image: Upload!
      ingredients: [String!]
      step: [String!]
      serving: Int!
      time: Int!
    }
    
    extend type Query {
      recipe(id: Int!): Recipe
      recipes: [Recipe]
      queryRecipes(query: String!): [Recipe]
    }
    extend type Mutation {
      addRecipe(recipe: NewRecipe, tags: [String!]): Recipe
      editRecipe(id: Int! recipe: NewRecipe, tags: [String!]): Recipe
      deleteRecipe(id: Int!): Response
    }`


const resolvers = {
  Query: {
    recipe: async (_, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");
      const data = await Recipe.findByPk(args.id, {
        include: Tag
      });
      return data;
    },
    recipes: async (_, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");
      const data = await Recipe.findAll({
        order: ['id', 'DESC'],
        include: Tag
      });
      return data;
    },
    queryRecipes: async (_, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");
      const { query } = args;

      const result = await Recipe.findAll({
        where: {
          [Op.or]: [
            {
              title: {
                [Op.iLike]: `%${query}%`
              }
            },
            {
              '$Tags.name$': {
                [Op.iLike]: `%${query}%`
              }
            }
          ]
        },
        include: Tag
      });

      return result;
    }
  },
  Mutation: {
    addRecipe: async (_, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");
      const { id } = context.user;
      const { createReadStream, filename, mimetype } = await args.recipe.image;
      const { Location } = await s3.upload({
        Body: createReadStream(),
        Key: `${uuid()}${extname(filename)}`,
        ContentType: mimetype
      }).promise();
      args.recipe.image = Location;
      const data = await Recipe.create(args.recipe);
      const dataUserRecipe = {
        UserId: id,
        RecipeId: data.id,
        favorites: false,
        plan: [],
        creation: true
      };
      await UserRecipe.create(dataUserRecipe);
      const { tags } = args;
      for (i in tags) {
        let newTag = await Tag.findOrCreate({
          where: {
            name: tags[i].trim().toLowerCase()
          }
        });
        let newPayload = {
          RecipeId: data.id,
          TagId: newTag[0].id
        };
        await RecipeTag.create(newPayload);
      }
      const result = await Recipe.findByPk(data.id, {
        include: Tag
      })
      // console.log(result, "ini di recipe schemaaaaaaaaaaaaaaaaaaaaaaa")
      return result;
    },
    editRecipe: async (_, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;

      const authorization = await UserRecipe.findOne({
        where: {
          RecipeId: args.id,
          UserId: user.id
        }
      })

      if (!authorization) throw new ForbiddenError(`You're not allowed to do that`);

      if (!authorization.creation) throw new ForbiddenError(`You're not allowed to do that`);

      const { createReadStream, filename, mimetype } = await args.recipe.image;
      const { Location } = await s3.upload({
        Body: createReadStream(),
        Key: `${uuid()}${extname(filename)}`,
        ContentType: mimetype
      }).promise();

      args.recipe.image = Location;

      const data = await Recipe.update(args.recipe, {
        where: { id: args.id },
        returning: true
      });
      const { tags } = args;
      await RecipeTag.destroy({ where: { RecipeId: data[1][0].id } })
      for (i in tags) {
        let newTag = await Tag.findOrCreate({
          where: {
            name: tags[i].trim().toLowerCase()
          }
        });
        let newPayload = {
          RecipeId: data[1][0].id,
          TagId: newTag[0].id
        };
        await RecipeTag.findOrCreate({
          where: newPayload
        });
      }
      const result = await Recipe.findByPk(data[1][0].id, {
        include: Tag
      })
      return result;
    },
    deleteRecipe: async (_, args, context) => {
      if (!context.user) throw new AuthenticationError("Please login first");

      const { user } = context;

      const authorization = await UserRecipe.findOne({
        where: {
          RecipeId: args.id,
          UserId: user.id
        }
      })

      if (!authorization) throw new ForbiddenError(`You're not allowed to do that`);

      if (!authorization.creation) throw new ForbiddenError(`You're not allowed to do that`);
      await Recipe.destroy({ where: { id: args.id } });
      return { message: "Recipe has been deleted" };
    }
  }
}

module.exports = {
  typeDefs,
  resolvers
}
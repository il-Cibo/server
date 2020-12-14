const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server')
const fs = require('fs')
const { serverTest, server } = require('../app')
const { resolve } = require('path');
const { User } = require('../models/');
const { JSONWebToken } = require('../helpers');

let userToken
let UserId
let recipeId

beforeAll(async () => {
  const create = await User.create({
    username: 'test',
    email: 'test@test.com',
    password: 'test123',
    gender: 'test',
    name: 'test',
    avatar: 'test'
  }, { returning: true })

  UserId = create.id;

  const tokenPayload = {
    id: create.id,
    username: create.username
  }
  const token = JSONWebToken.signToken(tokenPayload);
  userToken = token

  const { query, mutate } = createTestClient(serverTest(userToken));

  const filename = './tests/download.jpeg';
  const file = fs.createReadStream(resolve(filename))

  const MUTATION = `
      mutation createRecipe($recipe: NewRecipe, $tags: [String!]) {
        addRecipe(recipe: $recipe, tags: $tags) {
          id
          title
          description
          image
          ingredients
          step
          serving
          time
        }
      }`

  const recipe = await mutate({
    mutation: MUTATION,
    variables: {
      recipe: {
        title: "asd",
        description: "asd",
        image: new Promise(resolve => resolve({
          filename,
          createReadStream: () => file,
          stream: file,
          mimetype: `image/jpeg`
        })),
        ingredients: "asd",
        step: "asd",
        serving: 3,
        time: 3
      },
      tags: ["asd", "asdf"]
    }
  })

  recipeId = recipe.data.addRecipe.id
  console.log(recipeId)
})

afterAll(async () => {
  await User.destroy({
    where: {
      id: UserId
    }
  })
})

describe('add favorite', () => {

  test('add favorite success', async () => {
    const { query, mutate } = createTestClient(serverTest(userToken));

    const test = await mutate({
      mutation: gql`
      mutation {
        addFav(id: ${recipeId}) {
          UserId
          RecipeId
          favorites
          plan
        }
      }`
    })

    console.log(test)
  })

})

describe('find favorite', () => {

  test('find favorite success', async () => {
    const { query, mutate } = createTestClient(serverTest(userToken));

    const test = await query({
      query: gql`
      query {
        findFav {
          username
          email
          gender
          name
          avatar
        }
      }`
    })

    console.log(test)
  })

})

describe('delete favorite', () => {

  test('delete favorite success', async () => {
    const { query, mutate } = createTestClient(serverTest(userToken));

    const test = await mutate({
      mutation: gql`
      mutation {
        deleteFav(id: ${recipeId}) {
          UserId
          RecipeId
          favorites
          plan
        }
      }`
    })

    console.log(test)
  })

})

describe('add plan', () => {

  test('add plan success', async () => {
    const { query, mutate } = createTestClient(serverTest(userToken));

    const test = await mutate({
      mutation: gql`
      mutation {
        addToPlan(id: ${recipeId}, plan: "asd") {
          UserId
          RecipeId
          favorites
        }
      }`
    })

    console.log(test)
  })

})

describe('find plan', () => {

  test('find plan success', async () => {
    const { query, mutate } = createTestClient(serverTest(userToken));

    const test = await query({
      query: gql`
      query {
        findPlan {
          username
          email
          gender
          name
          avatar
        }
      }`
    })

    console.log(test)
  })

})

describe('delete plan', () => {

  test('delete plan success', async () => {
    const { query, mutate } = createTestClient(serverTest(userToken));

    const test = await mutate({
      mutation: gql`
      mutation {
        removePlan(id: ${recipeId}, plan: "asd") {
          UserId
          favorites
          plan
        }
      }`
    })

    console.log(test)
  })
})

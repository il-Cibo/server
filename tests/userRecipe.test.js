const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server')
const fs = require('fs')
const { server } = require('../app')
const { resolve } = require('path');
const { User } = require('../models/');
const { JSONWebToken } = require('../helpers');

let userToken
let UserId
let RecipeId

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

  const { query, mutate } = createTestClient(server(userToken));

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
        ingredients: ["asd"],
        step: ["asd"],
        serving: 3,
        time: 3
      },
      tags: ["asd"]
    }
  })

  RecipeId = recipe.data.addRecipe.id
})

afterAll(async () => {
  const { query, mutate } = createTestClient(server(userToken));

  const MUTATION = `
  mutation delete ($RecipeId: Int!) {
    deleteRecipe(id: $RecipeId) {
      message
    }
  }`

  await mutate({
    mutation: MUTATION,
    variables: {
      RecipeId
    }
  })

  await User.destroy({
    where: {
      id: UserId
    }
  })
})

describe('add favorite', () => {

  test('add favorite success', async (done) => {
    const { query, mutate } = createTestClient(server(userToken));

    const MUTATION = `
    mutation add($RecipeId: Int!) {
      addFav(id: $RecipeId) {
        UserId
        RecipeId
        favorites
        plan
      }
    }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        RecipeId
      }
    })

    console.log(test)
    done()
  })

  test('add favorite error, token invalid', async (done) => {
    const { query, mutate } = createTestClient(server('userToken'));

    const MUTATION = `
    mutation add($RecipeId: Int!) {
      addFav(id: $RecipeId) {
        UserId
        RecipeId
        favorites
        plan
      }
    }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        RecipeId
      }
    })

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));
    done()
  })

})

describe('find favorite', () => {

  test('find favorite success', async (done) => {
    const { query, mutate } = createTestClient(server(userToken));

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
    expect(test.data.findFav).toEqual({
      username: expect.any(String),
      email: expect.any(String),
      gender: expect.any(String),
      name: expect.any(String),
      avatar: expect.any(String)
    })
    done()
  })

  test('find favorite error, token invalid', async (done) => {
    const { query, mutate } = createTestClient(server('userToken'));

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

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));
    done()
  })

})

describe('delete favorite', () => {

  test('delete favorite success', async (done) => {
    const { query, mutate } = createTestClient(server(userToken));

    const MUTATION = `
    mutation delete($RecipeId: Int!) {
      deleteFav(id: $RecipeId) {
        UserId
        RecipeId
        favorites
        plan
      }
    }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        RecipeId
      }
    })

    console.log(test)
    done()
  })

  test('delete favorite error, token invalid', async (done) => {
    const { query, mutate } = createTestClient(server('userToken'));

    const MUTATION = `
    mutation delete($RecipeId: Int!) {
      deleteFav(id: $RecipeId) {
        UserId
        RecipeId
        favorites
        plan
      }
    }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        RecipeId
      }
    })

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));
    done()
  })

})

describe('add plan', () => {

  test('add plan success', async (done) => {
    const { query, mutate } = createTestClient(server(userToken));

    const MUTATION = `
    mutation addPlan($RecipeId: Int!, $plan: String!) {
      addToPlan(id: $RecipeId, plan: $plan) {
        UserId
        RecipeId
        favorites
        plan
      }
    }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        RecipeId,
        plan: "12-12-2022"
      }
    })

    console.log(test)
    done()
  })

  test('add plan error, invalid token', async (done) => {
    const { query, mutate } = createTestClient(server('userToken'));

    const MUTATION = `
    mutation addPlan($RecipeId: Int!, $plan: String!) {
      addToPlan(id: $RecipeId, plan: $plan) {
        UserId
        RecipeId
        favorites
        plan
      }
    }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        RecipeId,
        plan: "12-12-2022"
      }
    })

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));
    done()
  })

})

describe('find plan', () => {

  test('find plan success', async (done) => {
    const { query, mutate } = createTestClient(server(userToken));

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

    expect(test.data.findPlan).toEqual({
      username: expect.any(String),
      email: expect.any(String),
      gender: expect.any(String),
      name: expect.any(String),
      avatar: expect.any(String)
    })
    done()
  })

  test('find plan error, invalid token', async (done) => {
    const { query, mutate } = createTestClient(server('userToken'));

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

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));
    done()
  })

})

describe('delete plan', () => {

  test('delete plan success', async (done) => {
    const { query, mutate } = createTestClient(server(userToken));

    const MUTATION = `
    mutation delete($RecipeId: Int!) {
      removePlan(id: $RecipeId, plan: "12-12-2022") {
        UserId
        favorites
        plan
      }
    }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        RecipeId
      }
    })

    console.log(test)
    done()
  })

  test('delete plan error, invalid token', async (done) => {
    const { query, mutate } = createTestClient(server('userToken'));

    const MUTATION = `
    mutation delete($RecipeId: Int!) {
      removePlan(id: $RecipeId, plan: "12-12-2022") {
        UserId
        favorites
        plan
      }
    }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        RecipeId
      }
    })

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));
    done()
  })
})

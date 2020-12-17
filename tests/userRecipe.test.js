const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server')
const fs = require('fs')
const { server } = require('../app')
const { resolve } = require('path');
const { User, UserRecipe } = require('../models/');
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

  const { mutate } = createTestClient(server(token));

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
  const { mutate } = createTestClient(server(userToken));

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
    const { mutate } = createTestClient(server(userToken));

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

    expect(test.data.addFav).toEqual({
      UserId: expect.any(Number),
      RecipeId: expect.any(Number),
      favorites: true,
      plan: expect.any(Array)
    })
    done()
  })

  test('add favorite success when favorite already created', async (done) => {
    const { mutate } = createTestClient(server(userToken));

    await UserRecipe.update({ favorites: false }, { where: { UserId, RecipeId } })

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

    expect(test.data.addFav).toEqual({
      UserId: expect.any(Number),
      RecipeId: expect.any(Number),
      favorites: true,
      plan: expect.any(Array)
    })
    done()
  })

  test('add favorite error, token invalid', async (done) => {
    const { mutate } = createTestClient(server('userToken'));

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
    const { query } = createTestClient(server(userToken));

    const test = await query({
      query: gql`
      query {
        findFav {
          username
          email
          gender
          name
          avatar
          Recipes {
            UserRecipe { favorites plan }
            Tags {
              name
            }
          }
        }
      }`
    })
    expect(test.data.findFav).toEqual({
      username: expect.any(String),
      email: expect.any(String),
      gender: expect.any(String),
      name: expect.any(String),
      avatar: expect.any(String),
      Recipes: expect.arrayContaining([expect.objectContaining({ UserRecipe: expect.objectContaining({ favorites: expect.any(Boolean) }) })]),
    })
    done()
  })

  test('find favorite error, token invalid', async (done) => {
    const { query } = createTestClient(server('userToken'));

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
    const { mutate } = createTestClient(server(userToken));

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

    expect(test.data.deleteFav).toEqual({
      UserId: expect.any(Number),
      RecipeId: expect.any(Number),
      favorites: false,
      plan: expect.any(Array)
    })
    done()
  })

  test('delete favorite error, token invalid', async (done) => {
    const { mutate } = createTestClient(server('userToken'));

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
    const { mutate } = createTestClient(server(userToken));

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

    expect(test.data.addToPlan).toEqual({
      RecipeId: expect.any(Number),
      UserId: expect.any(Number),
      favorites: expect.any(Boolean),
      plan: expect.arrayContaining(["12-12-2022"])
    })
    done()
  })

  test('add plan success when plan already created', async (done) => {
    const { mutate } = createTestClient(server(userToken));

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
        plan: "11-12-2022"
      }
    })

    expect(test.data.addToPlan).toEqual({
      RecipeId: expect.any(Number),
      UserId: expect.any(Number),
      favorites: expect.any(Boolean),
      plan: expect.arrayContaining(["11-12-2022", "12-12-2022"])
    })
    done()
  })

  test('add plan error, invalid token', async (done) => {
    const { mutate } = createTestClient(server('userToken'));

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
    const { query } = createTestClient(server(userToken));

    const test = await query({
      query: gql`
      query {
        findPlan {
          username
          email
          gender
          name
          avatar
          Recipes {
            UserRecipe { favorites plan }
            Tags {
              name
            }
          }
        }
      }`
    })

    expect(test.data.findPlan).toEqual({
      username: expect.any(String),
      email: expect.any(String),
      gender: expect.any(String),
      name: expect.any(String),
      avatar: expect.any(String),
      Recipes: expect.arrayContaining([expect.objectContaining({ UserRecipe: expect.objectContaining({ plan: expect.any(Array) }) })]),
    })
    done()
  })

  test('find plan error, invalid token', async (done) => {
    const { query } = createTestClient(server('userToken'));

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
    const { mutate } = createTestClient(server(userToken));

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

    expect(test.data.removePlan).toEqual({
      UserId: expect.any(Number),
      favorites: expect.any(Boolean),
      plan: ["11-12-2022"]
    })
    done()
  })

  test('delete plan error, invalid token', async (done) => {
    const { mutate } = createTestClient(server('userToken'));

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

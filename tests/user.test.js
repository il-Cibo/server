const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server')
const { server } = require('../app')
const { User } = require('../models/');

let userToken
let UserId

describe('user register test', () => {

  test('user register success', async (done) => {
    const { mutate } = createTestClient(server())

    const test = await mutate({
      mutation: gql`
      mutation {
        register(user: {
          username: "usertest"
          email: "usertest@test.com"
          password: "test123"
          gender: "test"
          name: "usertest"
          avatar: "usertest"
        }) {
          username
          email
          gender
          name
          avatar
        }
      }`
    })

    expect(test.data.register).toEqual({
      username: "usertest",
      email: "usertest@test.com",
      gender: "test",
      name: "usertest",
      avatar: "usertest"
    })
    done()
  })

  test('user register error, input empty', async (done) => {
    const { mutate } = createTestClient(server())

    const test = await mutate({
      mutation: gql`
      mutation {
        register(user: {
          username: ""
          email: ""
          password: ""
          gender: ""
          name: ""
          avatar: ""
        }) {
          username
          email
          gender
          name
          avatar
        }
      }`
    })

    expect(test.errors).toEqual(expect.any(Array))
    done()
  })

  test('user register error, wrong data type', async (done) => {
    const { mutate } = createTestClient(server())

    const test = await mutate({
      mutation: gql`
      mutation {
        register(user: {
          username: 123
          email: 123
          password: 123
          gender: 123
          name: 123
          avatar: 123
        }) {
          username
          email
          gender
          name
          avatar
        }
      }`
    })

    expect(test.errors).toEqual(expect.any(Array))
    done()
  })
})

describe('user login test', () => {

  test('user login success', async (done) => {
    const { query } = createTestClient(server())

    const test = await query({
      query: gql`
      query {
        login(user: {
          username: "usertest"
          password: "test123"
        }) {
          token
        }
      }`
    })

    userToken = test.data.login.token

    expect(test.data.login).toEqual({ token: expect.any(String) })
    done()
  })

  test('user login error, input empty', async (done) => {
    const { query } = createTestClient(server())

    const test = await query({
      query: gql`
      query {
        login(user: {
          username: ""
          password: ""
        }) {
          token
        }
      }`
    })

    expect(test.errors).toEqual(expect.any(Array))
    done()
  })

  test('user login error, wrong data type', async (done) => {
    const { query } = createTestClient(server())

    const test = await query({
      query: gql`
      query {
        login(user: {
          username: 123456
          password: 198765
        }) {
          token
        }
      }`
    })

    expect(test.errors).toEqual(expect.any(Array))
    done()
  })

  test('user login error, wrong password', async (done) => {
    const { query } = createTestClient(server())

    const test = await query({
      query: gql`
      query {
        login(user: {
          username: "usertest"
          password: "asd"
        }) {
          token
        }
      }`
    })

    expect(test.errors).toEqual(expect.any(Array))
    done()
  })
})

describe('fetch user data test', () => {

  test('fetch user data success', async (done) => {
    const { query, mutate } = createTestClient(server(userToken))

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

    await mutate({
      mutation: MUTATION,
      variables: {
        recipe: {
          title: "asd",
          description: "asd",
          image: "https://mealo-image.s3.ap-southeast-1.amazonaws.com/f0b6299d-cac6-4d25-b9a8-aa9aa53614fb.jpeg",
          ingredients: "asd",
          step: "asd",
          serving: 3,
          time: 3
        },
        tags: ["asd", "asdf"]
      }
    })

    const test = await query({
      query: gql`
      query {
        user {
          id
          username
          email
          gender
          name
          avatar
          Recipes {
            id
            title
            description
            image
            ingredients
            step
            serving
            time
            Tags {
              name
            }
          }
        }
      }`
    })

    UserId = test.data.user.id

    expect(test.data.user).toEqual({
      id: expect.any(Number),
      username: expect.any(String),
      email: expect.any(String),
      gender: expect.any(String),
      name: expect.any(String),
      avatar: expect.any(String),
      Recipes: expect.any(Array),
    })
    done()
  })

  test('fetch user data error, token invalid', async (done) => {
    const { query } = createTestClient(server('userToken'))

    const test = await query({
      query: gql`
      query {
        user {
          id
          username
          email
          gender
          name
          avatar
          Recipes {
            id
            title
            description
            image
            ingredients
            step
            serving
            time
            Tags {
              name
            }
          }
        }
      }`
    })

    expect(test.errors).toEqual(expect.any(Array))
    done()
  })
})

afterAll(async () => {
  await User.destroy({
    where: {
      id: UserId
    }
  })
})
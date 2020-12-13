const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server')
const server = require('../app')
const { query, mutate } = createTestClient(server);

const { User } = require('../models/');
const { UserController } = require('../controllers');

let userToken = ''

beforeAll(async () => {
  const create = await User.create({
    username: 'test',
    email: 'test@test.com',
    password: 'test123',
    gender: 'test',
    name: 'test',
    avatar: 'test'
  }, { returning: true })

  const { token } = await UserController.login({
    username: 'test',
    password: 'test123'
  })

  userToken = token
})

// afterAll(async () => {
//   await Recipe.destroy({ where: { id: 1 } })
// })

// describe('fetch all recipe test', () => {

//   test('fetch all recipe success', async () => {

//     server.context = () => {
//       const req = {
//         headers: {
//           "token": userToken
//         }
//       }
//       return { req }
//     };

//     console.log(userToken)

//     const test = await query({
//       query: gql`
//         query {
//           recipes {
//             id
//             title
//             description
//             image
//             ingredients
//             step
//             serving
//             time
//           }
//         }`
//     })
//     console.log(test)
//     expect(test).toHaveProperty('id')
//   });

//   test('fetch all recipe error, token undefined', async () => {

//     server.context = () => {
//       const req = {
//         headers: {
//           "token": undefined
//         }
//       }
//       return { req }
//     };

//     const test = await query({
//       query: gql`
//         query {
//           recipes {
//             id
//             title
//             description
//             image
//             ingredients
//             step
//             serving
//             time
//           }
//         }`
//     })
//     // console.log(test)
//   })
// })

// describe('fetch one recipe test', () => {

//   test('fetch one recipe success', async () => {

//     server.context = () => {
//       const req = {
//         headers: {
//           "token": userToken
//         }
//       }
//       return { req }
//     };

//     const test = await query({
//       query: gql`
//       query {
//         recipe(id:1) {
//           id
//           title
//           description
//           image
//           ingredients
//           step
//           serving
//           time
//         }
//       }`
//     })
//     expect(test).toHaveProperty('id')
//   });
// })

describe('create recipe test', () => {

  test('create recipe success', async () => {

    server.context = () => {
      const req = {
        headers: {
          "token": userToken
        }
      }
      return { req }
    };

    const test = await mutate({
      mutation: gql`
      mutation {
        addRecipe(recipe: {
          title: "asd"
          description: "asd"
          image: "asd"
          ingredients: ["asd"]
          step: ["asd"]
          serving: 123
          time: 123
        }, tags: ["asd"]) {
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
    })
    console.log(test)
    expect(test).toHaveProperty('id')
  })
})

// describe('edit recipe test', () => {

//   test('edit recipe success', async () => {

//     server.context = () => {
//       const req = {
//         headers: {
//           "token": userToken
//         }
//       }
//       return { req }
//     };

//     const test = await mutate({
//       mutation: gql`
//       mutation {
//         editRecipe(id: 1, recipe: {
//           title: "edit"
//           description: "edit"
//           image: "edit"
//           ingredients: ["edit"]
//           step: ["edit"]
//           serving: 123
//           time: 123
//         }) {
//           id
//           title
//           description
//           image
//           ingredients
//           step
//           serving
//           time
//         }
//       }`
//     })

//     expect(test).toHaveProperty('id')
//   })
// })

// describe('delete recipe test', () => {

//   test('delete recipe success', async () => {

//     server.context = () => {
//       const req = {
//         headers: {
//           "token": userToken
//         }
//       }
//       return { req }
//     };

//     const test = await mutate({
//       mutation: gql`
//       mutation {
//         deleteRecipe(id: 1) {
//           message
//         }
//       }`
//     })

//     expect(test).toHaveProperty('message')
//   })
// })

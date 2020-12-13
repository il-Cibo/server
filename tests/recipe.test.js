const { createTestClient } = require('apollo-server-testing');
const fs = require('fs')
const { serverTest } = require('../app')
const { User } = require('../models/');
const { resolve } = require('path');
const { JSONWebToken } = require('../helpers');

let userToken = ''
let UserId;

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
})

afterAll(async () => {
  await User.destroy({
    where: {
      id: UserId
    }
  })
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

    const test = await mutate({
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
    expect(test.data.addRecipe).toHaveProperty('id')
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

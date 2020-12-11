const { createTestClient } = require('apollo-server-testing');
const { gql } = require('apollo-server')
const server = require('../app')
const { query, mutate } = createTestClient(server);
// const { Recipe } = require('../models/');

// beforeAll(() => {
//   Recipe.create({
//     title: 'test'
//   })
// })

// afterAll(() => {
//   Recipe.destroy({ where: { id: 1 } }).then(console.log)
// })

test('fetch all recipe success', async () => {

  const test = await query({
    query: gql`
    query {
      recipes {
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
  console.log(test.data)
});

test('fetch one recipe success', async () => {

  const test = await query({
    query: gql`
    query {
      recipe(id:1) {
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
  console.log(test.data)
});

test('create recipe success', async () => {

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
      }) {
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
})

test('edit recipe success', async () => {

  const test = await mutate({
    mutation: gql`
    mutation {
      editRecipe(id: 1, recipe: {
        title: "edit"
        description: "edit"
        image: "edit"
        ingredients: ["edit"]
        step: ["edit"]
        serving: 123
        time: 123
      }) {
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
})

test('create recipe success', async () => {

  const test = await mutate({
    mutation: gql`
    mutation {
      deleteRecipe(id: 1) {
        message
      }
    }`
  })

  console.log(test)
})


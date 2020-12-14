const { createTestClient } = require('apollo-server-testing');
const fs = require('fs')
const { serverTest } = require('../app')
const { User } = require('../models/');
const { resolve } = require('path');
const { JSONWebToken } = require('../helpers');

let userToken;
let UserId;
let RecipeId;

beforeAll(async (done) => {
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
  done();
})

afterAll(async (done) => {
  await User.destroy({
    where: {
      id: UserId
    }
  })
  done();
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

describe('Recipe test', () => {

  test('create recipe success', async (done) => {
    const { mutate } = createTestClient(serverTest(userToken));

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
          Tags { name }
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
          ingredients: ["asd", "asdf"],
          step: ["asd", "asdf"],
          serving: 3,
          time: 3
        },
        tags: ["asd", "asdf"]
      }
    })

    RecipeId = test.data.addRecipe.id;

    expect(test.data.addRecipe).toEqual({
      id: expect.any(Number),
      title: "asd",
      description: "asd",
      image: expect.any(String),
      ingredients: ["asd", "asdf"],
      step: ["asd", "asdf"],
      serving: 3,
      time: 3,
      Tags: expect.arrayContaining([expect.objectContaining({ name: "asd"}), expect.objectContaining({ name: "asdf"})])
    })
    done();
  })

  test('create recipe failed on authentication', async (done) => {
    const { mutate } = createTestClient(serverTest());

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
          Tags { name }
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
          ingredients: ["asd", "asdf"],
          step: ["asd", "asdf"],
          serving: 3,
          time: 3
        },
        tags: ["asd", "asdf"]
      }
    })

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]))

    done();
  })


  test('find recipe success', async (done) => {
    const { query } = createTestClient(serverTest(userToken));

    const QUERY = `
      query findRecipe($id: Int!) {
        recipe(id: $id) {
          id
          title
          description
          image
          ingredients
          step
          serving
          time
          Tags { name }
        }
      }
    `
    const test = await query({
      query: QUERY,
      variables: {
        id: RecipeId
      }
    });

    expect(test.data.recipe).toEqual({
      id: expect.any(Number),
      title: "asd",
      description: "asd",
      image: expect.any(String),
      ingredients: ["asd", "asdf"],
      step: ["asd", "asdf"],
      serving: 3,
      time: 3,
      Tags: expect.arrayContaining([expect.objectContaining({ name: "asd"}), expect.objectContaining({ name: "asdf"})])
    })
    done();
  })

  test('find recipe failed on authentication', async (done) => {
    const { query } = createTestClient(serverTest());

    const QUERY = `
      query findRecipe($id: Int!) {
        recipe(id: $id) {
          id
          title
          description
          image
          ingredients
          step
          serving
          time
          Tags { name }
        }
      }
    `
    const test = await query({
      query: QUERY,
      variables: {
        id: RecipeId
      }
    });

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]))

    done();
  })

  test('find recipes success', async (done) => {
    const { query } = createTestClient(serverTest(userToken));

    const QUERY = `
      query findRecipe {
        recipes {
          id
          title
          description
          image
          ingredients
          step
          serving
          time
          Tags { name }
        }
      }
    `
    const test = await query({
      query: QUERY
    });

    expect(test.data.recipes).toEqual([{
      id: expect.any(Number),
      title: "asd",
      description: "asd",
      image: expect.any(String),
      ingredients: ["asd", "asdf"],
      step: ["asd", "asdf"],
      serving: 3,
      time: 3,
      Tags: expect.arrayContaining([expect.objectContaining({ name: "asd"}), expect.objectContaining({ name: "asdf"})])
    }])
    done();
  })

  test('find recipes failed on authentication', async (done) => {
    const { query } = createTestClient(serverTest());

    const QUERY = `
      query findRecipe {
        recipes {
          id
          title
          description
          image
          ingredients
          step
          serving
          time
          Tags { name }
        }
      }
    `
    const test = await query({
      query: QUERY
    });

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));
    
    done();
  })


  test('query recipes success', async (done) => {
    const { query } = createTestClient(serverTest(userToken));

    const QUERY = `
      query findRecipe($query: String!) {
        queryRecipes(query: $query) {
          id
          title
          description
          image
          ingredients
          step
          serving
          time
          Tags { name }
        }
      }
    `
    const test = await query({
      query: QUERY,
      variables: {
        query: "asd"
      }
    });

    expect(test.data.queryRecipes).toEqual([{
      id: expect.any(Number),
      title: "asd",
      description: "asd",
      image: expect.any(String),
      ingredients: ["asd", "asdf"],
      step: ["asd", "asdf"],
      serving: 3,
      time: 3,
      Tags: expect.arrayContaining([expect.objectContaining({ name: "asd"}), expect.objectContaining({ name: "asdf"})])
    }])
    done();
  })

  test('edit recipe success', async (done) => {
    const { mutate } = createTestClient(serverTest(userToken));

    const filename = './tests/download.jpeg';
    const file = fs.createReadStream(resolve(filename))

    const MUTATION = `
      mutation editRecipe($id: Int!, $recipe: NewRecipe, $tags: [String!]) {
        editRecipe(id: $id, recipe: $recipe, tags: $tags) {
          id
          title
          description
          image
          ingredients
          step
          serving
          time
          Tags { name }
        }
      }`

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        id: RecipeId,
        recipe: {
          title: "asdfgh",
          description: "asdfgh",
          image: new Promise(resolve => resolve({
            filename,
            createReadStream: () => file,
            stream: file,
            mimetype: `image/jpeg`
          })),
          ingredients: ["asdfgh", "asdfghj"],
          step: ["asdfgh", "asdfghj"],
          serving: 5,
          time: 5
        },
        tags: ["asdfgh", "asdfghj"]
      }
    })

    expect(test.data.editRecipe).toEqual({
      id: RecipeId,
      title: "asdfgh",
      description: "asdfgh",
      image: expect.any(String),
      ingredients: ["asdfgh", "asdfghj"],
      step: ["asdfgh", "asdfghj"],
      serving: 5,
      time: 5,
      Tags: expect.arrayContaining([expect.objectContaining({ name: expect.any(String)})])
    })
    done();
  })
  
  test('delete recipe success', async (done) => {
    const { mutate } = createTestClient(serverTest(userToken));

    const MUTATION = `
      mutation deleteRecipe($id: Int!) {
        deleteRecipe(id: $id) {
          message
        }
      }
    `;

    const test = await mutate({
      mutation: MUTATION,
      variables: {
        id: RecipeId
      }
    });
  
    expect(test.data.deleteRecipe).toEqual({
      message: "Recipe has been deleted"
    });

    done();
  })
})



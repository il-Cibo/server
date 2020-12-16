const { createTestClient } = require('apollo-server-testing');
const fs = require('fs')
const { server } = require('../app')
const { User } = require('../models/');
const { resolve } = require('path');
const { JSONWebToken } = require('../helpers');

let userToken;
let userToken2
let RecipeId;

beforeAll(async (done) => {
  const create = await User.bulkCreate([{
    username: 'test',
    email: 'test@test.com',
    password: 'test123',
    gender: 'test',
    name: 'test',
    avatar: 'test'
  }, {
    username: 'test1',
    email: 'test1@test.com',
    password: 'test123',
    gender: 'test',
    name: 'test',
    avatar: 'test'
  }], { returning: true })


  create.forEach((el, i) => {
    let token = JSONWebToken.signToken({ id: el.id, username: el.username })
    !i ? userToken = token : userToken2 = token
  })

  done();
})

afterAll(async (done) => {
  await User.destroy({ where: {} })
  done();
})

describe('Recipe test', () => {

  test('create recipe success', async (done) => {
    const { mutate } = createTestClient(server(userToken));

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
      Tags: expect.arrayContaining([expect.objectContaining({ name: "asd" }), expect.objectContaining({ name: "asdf" })])
    })
    done();
  })

  test('create recipe failed on authentication', async (done) => {
    const { mutate } = createTestClient(server(''));

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
    const { query } = createTestClient(server(userToken));

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
      Tags: expect.arrayContaining([expect.objectContaining({ name: "asd" }), expect.objectContaining({ name: "asdf" })])
    })
    done();
  })

  test('find recipe failed on authentication', async (done) => {
    const { query } = createTestClient(server(''));

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
    const { query } = createTestClient(server(userToken));

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
          Users { name }
        }
      }
    `
    const test = await query({
      query: QUERY
    });

    expect(test.data.recipes).toEqual(expect.arrayContaining([{
      id: expect.any(Number),
      title: expect.any(String),
      description: expect.any(String),
      image: expect.any(String),
      ingredients: expect.arrayContaining([expect.any(String)]),
      step: expect.arrayContaining([expect.any(String)]),
      serving: expect.any(Number),
      time: expect.any(Number),
      Tags: expect.arrayContaining([expect.objectContaining({ name: expect.any(String) }), expect.objectContaining({ name: "asdf" })]),
      Users: expect.arrayContaining([expect.objectContaining({ name: expect.any(String) })])
    }]))
    done();
  })

  test('find recipes failed on authentication', async (done) => {
    const { query } = createTestClient(server(''));

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
    const { query } = createTestClient(server(userToken));

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

    expect(test.data.queryRecipes).toEqual(expect.arrayContaining([{
      id: expect.any(Number),
      title: "asd",
      description: "asd",
      image: expect.any(String),
      ingredients: ["asd", "asdf"],
      step: ["asd", "asdf"],
      serving: 3,
      time: 3,
      Tags: expect.arrayContaining([expect.objectContaining({ name: "asd" }), expect.objectContaining({ name: "asdf" })])
    }]))
    done();
  })

  test('query recipes error, invalid token', async (done) => {
    const { query } = createTestClient(server('userToken'));

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

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));

    done();
  })

  test('edit recipe success', async (done) => {
    const { mutate } = createTestClient(server(userToken));

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
      Tags: expect.arrayContaining([expect.objectContaining({ name: expect.any(String) })])
    })

    done();
  })

  test('edit recipe error, invalid token', async (done) => {
    const { mutate } = createTestClient(server('userToken'));

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

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));

    done();
  })

  test('delete recipe success', async (done) => {
    const { mutate } = createTestClient(server(userToken));

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

  test('delete recipe error, invalid token', async (done) => {
    const { mutate } = createTestClient(server('userToken'));

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

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "Please login first"
    })]));

    done();
  })

  test('delete recipe error, user unauthorized', async (done) => {
    const { mutate } = createTestClient(server(userToken2));

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

    expect(test.errors).toEqual(expect.arrayContaining([expect.objectContaining({
      message: "You're not allowed to do that"
    })]));

    done();
  })
})



const { Tag, Recipe, User } = require('../models');

class TagController {
  static async create (name) {
    return await Tag.create({ name });
  }

  static async find(id) {
    return await Tag.findByPk(id, {
      include: {
        model: Recipe,
        include: User
      }
    })
  }
}

module.exports = TagController;
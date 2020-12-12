const { AuthenticationError } = require('apollo-server');
const { Bcrypt, JSONWebToken } = require('../helpers');
const { User, Recipe, Tag } = require('../models/');

class UserController {

  static async register(payload) {
    const newUser = await User.create(payload);
    return newUser;      
  }

  static async login(payload) {
    const { username, password } = payload;

    const user = await User.findOne({
      where: {
        username
      }
    });

    if (!user) throw new AuthenticationError ('Invalid email or password');

    if (!Bcrypt.comparePassword(password, user.password)) throw new AuthenticationError ('Invalid email or password');
    
    const token = JSONWebToken.signToken(user);
    return token;
  }

  static async find(id) {
    return await User.findByPk(id, {
      include: {
        model: Recipe,
        include: Tag
      }
    });
  }

}

module.exports = UserController
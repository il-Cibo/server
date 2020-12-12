const { AuthenticationError } = require('apollo-server');
const { Bcrypt, JSONWebToken } = require('../helpers');
const { User, Recipe, Tag } = require('../models/');

class UserController {

  static async register(payload) {
    const newUser = await User.create(payload);
    return newUser;      
  }

  static async login(userPayload) {
    const { username, password } = userPayload;

    const user = await User.findOne({
      where: {
        username
      }
    });

    console.log(user);

    if (!user) throw new AuthenticationError ('Invalid email or password');

    if (!Bcrypt.comparePassword(password, user.password)) throw new AuthenticationError ('Invalid email or password');
    
    const tokenPayload = {
      id: user.id,
      username: user.username
    }
    const token = JSONWebToken.signToken(tokenPayload);
    return { token };
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
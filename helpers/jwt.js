const jwt = require('jsonwebtoken')

class JSONWebToken {

  static signToken(payload) {
    const token = jwt.sign(payload, 'il-cibo')
    return token
  }

  static verifyToken(token) {
    const decoded = jwt.verify(token, 'il-cibo')
    return decoded
  }
}

module.exports = JSONWebToken
const jwt = require('jsonwebtoken')

class JSONWebToken {

  static signToken(payload) {
    const token = jwt.sign(payload, 'il-cibo')
    return token
  }

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, 'il-cibo')
      return decoded
    } catch (err) {
      return null
    }
  }
}

module.exports = JSONWebToken
const bcrypt = require('bcryptjs')

class Bcrypt {

  static hashPassword(data) {
    const salt = bcrypt.genSaltSync(10)
    const hash = bcrypt.hashSync(data, salt)
    return hash
  }

  static comparePassword(data, hash) {
    return bcrypt.compareSync(data, hash)
  }
}

module.exports = Bcrypt
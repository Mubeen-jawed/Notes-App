const jwt = require("jsonwebtoken")

const auth = async (req, res, next) => {
  try {

    const token = req.cookies.jwt
    const verifyUser = jwt.verify(token, 'secret')

    next();

  } catch (error) {
    res.status(401).send(error)
  }
}

module.exports = auth
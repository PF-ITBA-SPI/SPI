const jwt = require('jsonwebtoken')

/**
 * JWT verifier. Reads the HTTP `Authorization: Bearer <TOKEN>` header, if present, and attempts to decode the token
 * with one of the configured public keys configured. Sets `req.user.permissions` as an array of permissions granted to
 * this request (empty array if unauthenticated).
 *
 * @param req Express request
 * @param res Express response
 * @param next Next middleware (express)
 * @see <a href="https://expressjs.com/en/guide/writing-middleware.html">Writing Express middlewares</a>
 */
function verifier (req, res, next) {
  const tokenHeader = req.get('Authorization')

  // const fs = require('fs')
  // const adminToken = jwt.sign({}, fs.readFileSync('PATH TO ADMIN APP PRIVATE KEY'), { algorithm: 'RS256' })
  // console.log('Admin JWT:', adminToken)
  // const userToken = jwt.sign({}, fs.readFileSync('PATH TO USER APP PRIVATE KEY'), { algorithm: 'RS256' })
  // console.log('User JWT:', userToken)

  // Start as unauthenticated
  req.user = { permissions: [] }

  if (!tokenHeader || !/^Bearer .+/.test(tokenHeader)) {
    return next()
  }
  const token = tokenHeader.split('Bearer ')[1]

  // Attempt user auth
  try {
    const decodedUserToken = jwt.verify(token, process.env.USER_PUBLIC_KEY, { algorithm: 'RS256' })
    req.user = Object.assign(decodedUserToken, {
      permissions: ['user']
    })
    return next()
  } catch (e) {
    console.debug('Authorization as user failed, attempting admin authorization')
  }
  // Attempt admin auth
  try {
    const decodedAdminToken = jwt.verify(token, process.env.ADMIN_PUBLIC_KEY, { algorithm: 'RS256' })
    req.user = Object.assign(decodedAdminToken, {
      permissions: ['user', 'admin']
    })
    return next()
  } catch (e) {
    console.debug('Authorization as either user or admin failed, leaving unauthenticated')
  }
  return next()
}

/**
 * 403 error handler. Fired on unauthorized endpoint access and responds with HTTP 403 Forbidden.
 *
 * @param err Express error
 * @param req Express request
 * @param res Express response
 * @param _next Next middleware
 * @see <a href="https://github.com/MichielDeMey/express-jwt-permissions#error-handling">Inspiration from official docs</a>
 * @see <a href="https://expressjs.com/en/guide/error-handling.html">Writing error handlers in Express</a>
 */
function errorHandler (err, req, res, _next) {
  if (err.code === 'permission_denied') {
    res.status(403).send('Forbidden')
  }
}

module.exports = {
  verifier,
  errorHandler
}

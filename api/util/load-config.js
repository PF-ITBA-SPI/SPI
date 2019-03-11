// Load environment-specific config
let envFile = '.env'
if (process.env.NODE_ENV && process.env.NODE_ENV !== 'development') {
  envFile += '.' + process.env.NODE_ENV
}
require('dotenv-safe').config({
  path: envFile
})

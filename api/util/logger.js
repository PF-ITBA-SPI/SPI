// https://www.npmjs.com/package/debug
const debug = require('debug')

// Use debug package for console.*
global.console.debug = debug('spi:debug')
global.console.info = debug('spi:info')
global.console.log = debug('spi:info')
global.console.warn = debug('spi:warn')
global.console.error = debug('spi:error')

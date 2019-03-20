const os = require('os')
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

function generateKeypair(appName) {
  const PRIV_KEY_PATH = path.join(os.tmpdir(), appName)
  const PUB_KEY_PATH = `${PRIV_KEY_PATH}.pub`
  const commands = [
    // `ssh-keygen -t rsa -q -N "" -f ${PRIV_KEY_PATH}`,
    `ssh-keygen -t rsa -vvv -N "" -f ${PRIV_KEY_PATH}`,
    `ssh-keygen -f ${PRIV_KEY_PATH} -m "PKCS8" -e > ${PRIV_KEY_PATH}`,
    `ssh-keygen -f ${PUB_KEY_PATH} -m "PEM" -e > ${PUB_KEY_PATH}`
  ]
  commands.forEach(c => childProcess.execSync(c, {
    stdio: 'inherit',
    encoding: 'utf8'
  }))

  const formattedPrivateKey =
    fs.readFileSync(PRIV_KEY_PATH)
      .replace(/-----(BEGIN|END).+PRIVATE KEY-----/g, '')
      .replace(/\n/g, '')
  const formattedPublicKey =
    `"` +
    fs.readFileSync(PUB_KEY_PATH)
      .replace(/-----(BEGIN|END).+PUBLIC KEY-----/g, '')
      .replace(/\n/g, '\\n') +
    `"`

  fs.writeFileSync(path.join(__dirname, '..', `${appName}_formatted`), formattedPrivateKey)
  fs.writeFileSync(path.join(__dirname, '..', `${appName}_formatted.pub`), formattedPublicKey)
  fs.unlinkSync(PRIV_KEY_PATH)
  fs.unlinkSync(PUB_KEY_PATH)
}

function doTheThing () {
  generateKeypair('spi_admin')
  generateKeypair('spi_user')
}

if (require.main === module) {
  // Script was run directly
  doTheThing()
} else {
  module.exports = {
    generateKeypairs: doTheThing
  }
}

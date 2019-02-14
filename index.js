'use strict'
const debug = require('debug')('moneyd-uplink-http')
const inquirer = require('inquirer')
const crypto = require('crypto')
const getPort = require('get-port')

async function configure ({ advanced }) {
  const res = {}
  const fields = [{
    type: 'input',
    name: 'url',
    message: 'URL of ILP-HTTP endpoint.'
  }, {
    type: 'input',
    name: 'secret',
    message: 'Secret for ILP-HTTP endpoint.'
  }, {
    type: 'input',
    name: 'assetCode',
    message: 'assetCode',
    default: 'XRP'
  }, {
    type: 'input',
    name: 'assetScale',
    message: 'assetScale',
    validate: ((answer) => !isNaN(Number(answer))),
    default: '9'
  }, {
    type: 'confirm',
    name: 'http2',
    message: 'Use HTTP2?',
    default: false
  }]

  for (const field of fields) {
    if (advanced || field.default === undefined) {
      res[field.name] = (await inquirer.prompt(field))[field.name]
    } else {
      res[field.name] = field.default
    }
  }

  const port = await getPort()
  const secret = crypto.randomBytes(32).toString('base64')

  console.log('run `moneyd http:start` to connect to Interledger.')
  console.log(`will listen for incoming http on http://localhost:${port} w/ secret ${secret}`)
  return {
    relation: 'parent',
    plugin: require.resolve('ilp-plugin-http'),
    assetCode: res.assetCode,
    assetScale: Number(res.assetScale),
    sendRoutes: false,
    receiveRoutes: false,
    options: {
      incoming: {
        port,
        secret
      },
      outgoing: {
        url: res.url,
        secret: res.secret,
        http2: res.http2
      }
    }
  }
}

const commands = []

module.exports = {
  configure,
  commands
}

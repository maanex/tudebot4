/* This config file is used to build the docker image */

const fs = require('fs')

console.log('-----------------')
console.log(JSON.stringify(fs.readdirSync('/run/secrets'), null, 2))
console.log('-----------------')

function secret(name) {
  try {
    return fs.readFileSync('/run/secrets/' + name)
  } catch (ex) {
    return process.env[name]
  }
}


console.log(secret('TUDEBOT_MONGO_URL'))

module.exports = {
  bot: {
    token: secret('TUDEBOT_DBOT_TOKEN'),
    clientid: secret('TUDEBOT_DBOT_ID') || '268461185173684224'
  },
  mongodb: {
    url: secret('TUDEBOT_MONGO_URL')
  },
  thirdparty: {
    wit: {
      token: secret('TUDEBOT_WIT_TOKEN')
    },
    obrazium: {
      token: secret('TUDEBOT_OBRAZIUM_TOKEN')
    },
    googleapis: {
      key: secret('TUDEBOT_GOOGLE_KEY')
    },
    ksoft: {
      token: secret('TUDEBOT_KSOFT_TOKEN')
    },
    alexa: {
      key: secret('TUDEBOT_ALEXA_KEY')
    },
    gibuapis: {
      endpoint: secret('TUDEBOT_GIBU_ENDPOINT') || '',
      key: ''
    }
  },
  server: {
    port: 9005
  },
  lang: 'en',
  admins: [
    '137258778092503042'
  ]
}

/* This config file is used to build the docker image */

const fs = require('fs')


function secret(name) {
  try {
    return fs.readFileSync('/run/secrets/' + name).toString()
  } catch (ex) {
    return process.env[name]
  }
}

TODO update mongodb url to use /tudebot collection


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
      gqlEndpoint: secret('TUDEBOT_GIBU_GQL_ENDPOINT') || '',
      pipelineEndpoint: secret('TUDEBOT_GIBU_PIPELINE_ENDPOINT') || '',
      key: ''
    }
  },
  security: {
    vaultPublicKeyPath: secret('TUDEBOT_VAULT_PUBLIC_KEY_PATH') || '',
    vaultPrivateKeyPath: secret('TUDEBOT_VAULT_PRIVATE_KEY_PATH') || ''
  },
  server: {
    port: 80,
    publicHost: 'https://tudebot.tude.network'
  },
  lang: 'en',
  admins: [
    '137258778092503042'
  ]
}

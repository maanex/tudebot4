

export type configjs = {
  bot: {
    token: string
    clientid: string
  }
  mongodb: {
    url: string
  }
  thirdparty: {
    wit: {
      token: string
    }
    obrazium: {
      token: string
    }
    googleapis: {
      key: string
    }
    ksoft: {
      token: string
    }
    alexa: {
      key: string
    }
    gibuapis: {
      gqlEndpoint: string
      pipelineEndpoint: string
      key: string
    }
  }
  security: {
    vaultPublicKeyPath: string
    vaultPrivateKeyPath: string
  }
  server: {
    port: number
    publicHost: string
  }
  lang: string
  admins: string[]
}

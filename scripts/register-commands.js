/* eslint-disable no-console */
const axios = require('axios')
const config = require('../config.js')

if (!config) throw new Error('Config not found. Please cd into /scripts')

const token = config.bot.token
const clientid = config.bot.clientid

const commands = [
  {
    name: 'whois',
    description: 'Get detailed information about a user or bot',
    options: [
      {
        type: 6,
        name: 'user',
        description: 'The user to get more information about. Defaults to yourself.',
        required: false
      }
    ]
  },
  {
    name: 'trivia',
    description: 'It\'s trivia. What do I write here?'
  },
  {
    name: 'ship',
    description: 'Get a cute shipping name and get to know how good the chances are :)',
    options: [
      {
        type: 3,
        name: 'name1',
        description: 'The first person',
        required: true
      },
      {
        type: 3,
        name: 'name2',
        description: 'The second person',
        required: true
      }
    ]
  },
  {
    name: 'namestylist',
    description: 'Like a hair stylist but for names! Give your old name a new and fresh look!'
  },
  {
    name: 'iqtest',
    description: 'Test your IQ and a very quick IQ test used to test your IQ.'
  }
]

async function run(remove = true, add = true, whitelist, guildid) {
  const opts = {
    headers: { Authorization: `Bot ${token}` }
  }

  const { data } = await axios.get(`https://discord.com/api/v8/applications/${clientid}${guildid ? `/guilds/${guildid}` : ''}/commands`, opts)

  if (remove) {
    await Promise.all(data
      .filter(d => !whitelist || whitelist.includes(d.name))
      .map(d => axios.delete(`https://discord.com/api/v8/applications/${clientid}${guildid ? `/guilds/${guildid}` : ''}/commands/${d.id}`, opts))
    )
  }

  if (add) {
    for (const command of commands) {
      if (whitelist && !whitelist.includes(command.name)) continue
      axios
        .post(`https://discord.com/api/v8/applications/${clientid}${guildid ? `/guilds/${guildid}` : ''}/commands`, command, opts)
        .catch(err => console.error(err.response.status, command.name, JSON.stringify(err.response.data, null, 2)))
    }
  }
}
run(false, true, [ 'iqtest' ], '342620626592464897')

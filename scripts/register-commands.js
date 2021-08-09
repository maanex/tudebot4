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
  },
  {
    name: 'image',
    description: 'Get an image of your choice',
    options: [
      {
        type: 3,
        name: 'kind',
        description: 'What kind of image would you like to see?',
        required: true,
        choices: [
          { name: '🔀 Random', value: 'random' },
          { name: '🐈 Cat', value: 'cat' },
          { name: '🐕 Dog', value: 'dog' },
          { name: '✨ Inspiration', value: 'inspiration' },
          { name: '😳 You', value: 'you' }
          // { name: '🦎 Gecko', value: 'gecko' },
          // { name: '🐇 Rabbit', value: 'rabbit' },
          // { name: '🦊 Fox', value: 'fox' },
          // { name: '🐖 Pig', value: 'pig' },
          // { name: '🐦 Bird', value: 'bird' },
          // { name: '🐜 Ant', value: 'ant' },
          // { name: '🙏 Jesus', value: 'jesus' }
        ]
      }
    ]
  },
  {
    name: 'ban',
    description: 'Ban someone',
    options: [
      {
        type: 6,
        name: 'user',
        description: 'The person to ban',
        required: true
      },
      {
        type: 3,
        name: 'reason',
        description: 'Why did the person get banned?',
        required: true,
        choices: [
          { name: 'Spam', value: 'spam' },
          { name: 'Fraud / Scamming', value: 'fraud' },
          { name: 'Annoying', value: 'annoying' },
          { name: 'Other', value: 'other' }
        ]
      },
      {
        type: 3,
        name: 'clear',
        description: 'Delete user messages on ban (optional)',
        required: false,
        choices: [
          { name: 'Do not delete', value: '0' },
          { name: '1 day', value: '1' },
          { name: '3 days', value: '3' },
          { name: '1 week', value: '7' }
        ]
      },
      {
        type: 3,
        name: 'comment',
        description: 'Attach a comment to the ban. Could be a more detailed reason or anything else.',
        required: false
      }
    ]
  },
  {
    name: 'kick',
    description: 'Kick someone',
    options: [
      {
        type: 6,
        name: 'user',
        description: 'The person to kick',
        required: true
      },
      {
        type: 3,
        name: 'reason',
        description: 'Why did the person get kicked?',
        required: true,
        choices: [
          { name: 'Spam', value: 'spam' },
          { name: 'Fraud / Scamming', value: 'fraud' },
          { name: 'Annoying', value: 'annoying' },
          { name: 'Other', value: 'other' }
        ]
      },
      {
        type: 3,
        name: 'comment',
        description: 'Attach a comment to the kick. Could be a more detailed reason or anything else.',
        required: false
      }
    ]
  },
  {
    name: 'showme',
    description: 'Show me something',
    options: [
      {
        type: 3,
        name: 'what',
        description: 'What shall I show you?',
        required: true,
        choices: [
          { name: 'A joke', value: 'joke' },
          { name: 'A cocktail', value: 'cocktail' },
          { name: 'A meal', value: 'meal' }
        ]
      }
    ]
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
run(false, true, [ 'showme' ], '342620626592464897')

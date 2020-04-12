# TudeBot

This is a custom discord bot, build exclusivly for the [Tude Discord Server](https://discord.gg/mJnQXet).
Some of it's features include but are not limited to:
* Selfroles
* Modlog
* Daily Rewards / Economy
* Roulette and other casino games
* Channel Games (soon :tm:)

> **Spoilers ahead!** Taking a look at the source code will reveal most if not all of the bot's eastereggs. I know this is tempting but discovering them yourself is a lot more fun, trust me!


### Why open-source?

People started complaining that the casino games are rigged. Here you go, proof yourself wrong


### Can I run my own instance of the bot?

Not really.
The bot relies on two private APIs (see below), though that doesn't mean that you can't use parts of the codebase for your own work. If you do, make sure you reach out to me, I'd love to see your projects!

#### WCP
You might sooner or later stumble upon an API wrapper for "WCP". WCP is - amongst other purposes - the admin web dashboard to manage the bot. It is used to monitor the bot aswell as giving easy access to settings, configs and content.

#### Tude API
The Tude API is core to the "Social" / "Economy" part of the bot. The api will handle everything from storing users in the database over generating leaderboards to calculating daily rewards. You won't find the source code for that in here. You are however fully able to see all the commands that don't need the api in the first place like basic image commands (dogs, cats, ...) and even roulette and slotmachine sourcecode to verify that it's not rigged :(


### Contributors

[Me, Maanex](https://maanex.tk/)

*Yup, that's it. If you want to contribute, feel free to reach out to me via discord*


### Ew, why is the build folder included?
Because of the build / deploy process. Can't give any further details but it's on purpose.


### Libraries and Third-party services used

discord.js

mongodb

wit.ai

api.badosz.com

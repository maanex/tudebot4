/* eslint-disable no-undef */
import { TextChannel } from 'discord.js'
import * as cron from 'cron'
import axios from 'axios'
import { Module } from '../types/types'
import { TudeBot } from '../index'
import randomWikiContent from '../lib/wikipedia/random-wiki-content'


export default class DailyTopicModule extends Module {

  private interval: NodeJS.Timeout;
  private lastDay = '';
  private cronjob: cron.CronJob;

  constructor(conf: any, data: any, guilds: Map<string, any>, lang: (string) => string) {
    super('Daily Topic', '🧩', 'Sends one topic of the day, every day', 'With this module your chat will never die. Or at least it will get revived every 24h when the bot sends a new topic of the day.', 'public', conf, data, guilds, lang)
  }

  public onEnable() {
    // TODO enable below for non debug
    // this.cronjob = cron.job('0 0 * * *', () => this.run())
    // this.cronjob = cron.job('* * * * *', () => this.run())
    // this.cronjob.start()
    // setInterval(() => this.run(), 5000)
  }

  public onBotReady() {
  }

  public onDisable() {
    clearInterval(this.interval)
    this.interval = undefined
    this.cronjob?.stop()
  }

  private async run() {
    for (const g of this.guilds.keys()) {
      const guild = TudeBot.guilds.resolve(g)
      if (!guild) continue
      const channel = guild.channels.resolve(this.guilds.get(g).channel)
      if (!channel || channel.type !== 'GUILD_TEXT') continue;
      (channel as TextChannel).send(await this.generateTopic(g))
    }
  }

  public async generateTopic(guildid: string, maxAttempts = 3): Promise<string> {
    // TODO save last week of topics in an array to not get the same kind of topic too many times in a row

    const kind = this.weightedSelect(this.topics, o => o[0])
    try {
      // need to do like this or trycatch won't catch (i am mad)
      const topic = await this.topics[kind][1]()
      return topic
    } catch (ex) {
      console.error(ex)
      if (maxAttempts <= 1) return Promise.resolve('nah')
      return this.generateTopic(guildid, maxAttempts--)
    }
  }

  private weightedSelect(input: Record<string, any>, mapFunc?: (object: any) => number): string {
    const totalScore = Object
      .values(input)
      .map(obj => mapFunc?.(obj) ?? obj)
      .reduce((a, b) => a + b, 0)

    let countdown = ~~(Math.random() * totalScore)

    for (const topic of Object.keys(input)) {
      countdown -= mapFunc?.(input[topic]) ?? input[topic]
      if (countdown <= 0) return topic
    }

    return Object.keys(input)[0]
  }

  //

  public topics: Record<string, [number, () => Promise<string>]> = {
    dayfact: [ 10, async () => {
      const { data } = await axios.get(`http://numbersapi.com/${new Date().getMonth() + 1}/${new Date().getDate()}/date`)
      return data
    } ],
    emoji: [ 10, () => {
      const emojis = this.data.emojis.split(' ')
      const emoji = emojis[Math.floor(Math.random() * emojis.length)]
      return Promise.resolve(emoji)
    } ],
    news: [ 15, async () => {
      const { data } = await axios.get('https://www.reddit.com/r/worldnews/top.json')
      const post = data.data.children[Math.floor(Math.random() * 5)].data.title
      return post
    } ],
    redditImagery: [ 30, async () => {
      const subs = {
        // subreddit: [ weight, show caption, require image ]
        mildlyinteresting: [ 10, true, true ],
        woahdude: [ 10, Math.random() < 0.5, true ],
        photoshopbattles: [ 5, true, true ],
        BreadStapledToTrees: [ 5, false, true ],
        fourthworldproblems: [ 5, false, true ],
        fifthworldproblems: [ 5, true, false ],
        HaveWeMet: [ 5, true, false ],
        ShowerOrange: [ 2, false, true ],
        TooAfraidToAsk: [ 8, true, false ],
        AskReddit: [ 8, true, false ]
      }
      const sub = this.weightedSelect(subs)
      const showCaption = subs[sub][1]
      const requireImage = subs[sub][2]

      const { data } = await axios.get(`https://www.reddit.com/r/${sub}/hot.json`)
      const post = data.data.children[Math.floor(Math.random() * data.data.children.length)]
      if (!post?.data) throw new Error('no data')
      const caption = post.data.title?.replace(/(of )?reddit/gi, '').replace(/ {2,}/g, ' ')
      const imageUrl = post.data.preview?.images?.length ? post.data.url : ''
      if (!imageUrl && requireImage) throw new Error('no image')

      const out = []
      if (showCaption) out.push(caption)
      if (imageUrl) out.push(imageUrl)

      return out.join('\n')
    } ],
    website: [ 10, () => {
      const websites = this.data.websites
      const website = websites[Math.floor(Math.random() * websites.length)]
      return Promise.resolve(website)
    } ],
    weird: [ 10, () => {
      const weirds = this.data.weirds
      const weird = weirds[Math.floor(Math.random() * weirds.length)]
      return Promise.resolve(weird)
    } ],
    wikipedia: [ 15, async () => {
      const article = await randomWikiContent()
      return article.content
        .split('\n')
        .filter(l => !!l)
        .filter(l => /^[a-z]/gi.test(l))
        .slice(0, 18)
        .join('\n')
        .substring(0, 1980)
    } ]
  }

}


/*

::root
who is (user) and why do they (action)
why does (user) (action)
why do people (action)
who would win in a (fight_name), (user) or (user)?
who looks the most like (person)?
(user) (kinda) reminds me of (person)
(user) (kinda) reminds me of (person), don't you think?
(user) (kinda) reminds me of (person)... or is it just me?
(user)
(person)
(things)
Frank
Today we only talk about (user). If anyone tries to switch the topic they'll get banned!
(what_is) the (adjective) (thing)?
(what_is) the (adjective) (thing) you know of?
(what_is) your faviourite (thing)?
who would be the best couple in this server?
share your (adjective) (shareables)
share the (adjective) (shareables)
what would you do without (things)?
it's your last day on earth, what do you do?
[redacted]
(how_tos) (doable) while being (personal_condition)
(how_tos) (doable) while being (personal_condition)?

(x emoji)
(x fact_about_today)
(urban_dictionary_word_with_description)
(random_wikihow_article)
(x reddit_news_headline)
(random_meme_from_reddit)
(wtf) is that? (weird_amazon_article)

---

::what_is
what's
what is

::you_are
you're
you are

::it_is
it is
it's

::kinda
kinda
kind of
sort of

---

::how_tos
how to
how do you
how does one

::wtf
WTF
wtf
what the fuck
what the fook
what the hell
what the heck
what on earth
the fuck

---

::adjective
best
worst
cutest
weirdest
strangest
coolest
most interesting
least interesting
most boring

::shareables
cat images
dog images
animal images
memes
wholesome memes
quotes
screenshots
selfies
recepies
wikihow articles
(things)

::fight_name
fist fight
box fight
gun fight
sword fight
fight for life and death
fight for honor
league of legends 1v1
cs:go 1v1

::action
like (things)?
not like (things)?
hate (things)?
love (things)?
look so... (mood) today?

::mood
happy
sad
burnt out
depressed
lonely
great
awesome

::thing
game
car
computer game
board game
kind of sport
website
food
youtube video
series
movie
social media
book
piece of clothing
animal
country
compliment
way to (doable)

::things
(person)
(user)
games
cars
books
movies
alcohol
friends
any money
social media

::person
Elon Musk
Floyd Mayweather
Katy Perry
Howard Stern
Garth Brooks
James Patterson
Robert Downey Jr.
Taylor Swift
Rush Limbaugh
Ellen DeGeneres
Lionel Messi
Dr. Phil McGraw
Calvin Harris
LeBron James
Justin Timberlake
David Copperfield
Sean Combs
Ryan Seacrest
Lady Gaga
Jay Z
Beyonce Knowles
Kevin Durant
Toby Keith
Kim Kardashian
Jennifer Lawrence
Paul McCartney
Phil Mickelson
Tiger Woods
Kobe Bryant
Ben Roethlisberger
Vin Diesel
Judy Sheindlin
Jason Aldean
Luke Bryan
Kenny Chesney
Bradley Cooper
Adam Sandler
Tom Cruise
Bruno Mars
Drake
Tim McGraw
Florida Georgia Line
Jimmy Buffett
Jerry Seinfeld
Scarlett Johansson
David Letterman
Jon Lester
Derrick Rose
Maroon 5
Dr. Dre
Zac Brown Band
Mark Wahlberg
Pharrell Williams
Dwayne Johnson
Eminem
Britney Spears
Carmelo Anthony
Johnny Depp
Maria Sharapova
Leonardo DiCaprio
Sean Hannity
Carson Palmer
Jim Parsons
Channing Tatum
Kevin Hart
Miranda Lambert
Jennifer Lopez

::doable
make a mess
make money
make a lot of money
trade stocks
waste time
work out
download the shrek movie
survive a monkey attack
stalk (user)
pet a lion
escape depression
multiply two numbers
beat box
meditate
become famous
break up with your partner
survive an ancounter with an ostrich
dance
get into a romantic relationship
become a doctor
act normal
win a checkpot
make friends

::personal_condition
trapped in a basement
in online classes
on a date
chased by (user)
chased by (person)
chased by police
asked for directions
in a hospital
grocery shopping
high
super thirsty
very tired
as lazy as possible
in church
on an interview in national news

*/

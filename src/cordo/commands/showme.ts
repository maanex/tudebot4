import axios from 'axios'
import { InteractionApplicationCommandCallbackData, ReplyableCommandInteraction } from 'cordo'
import { MessageEmbed } from 'discord.js'


const bringers = {
  none: () => Promise.resolve({ content: 'pfff' } as InteractionApplicationCommandCallbackData),
  joke,
  cocktail,
  meal
}

export default async function (i: ReplyableCommandInteraction) {
  const what = (i.data.option.what || 'none') + ''
  const content = await bringers[what]()
  i.reply(content)
}

function joke(): Promise<InteractionApplicationCommandCallbackData> {
  const joke = jokes[Math.floor(Math.random() * jokes.length)]
  let title = joke
  let description = ''
  if (joke.includes('?')) {
    title = joke.split('?')[0] + '?'
    description = joke.substring(title.length + 1)
  }
  return Promise.resolve({ title, description })
}

async function cocktail(): Promise<InteractionApplicationCommandCallbackData> {
  const url = 'https://www.thecocktaildb.com/api/json/v1/1/random.php'
  try {
    const { data: o } = await axios.get(url)
    if (!o || !o.drinks || !o.drinks.length) {
      return {
        title: 'Couldn\'t load the cocktail list!',
        description: 'Maybe just get yourself a glass of water or something.'
      }
    }
    const drink = o.drinks[0]

    const ingredients = []
    let i = 1
    while (drink['strIngredient' + i]) {
      ingredients.push(`${drink['strMeasure' + i]} **${drink['strIngredient' + i]}**`)
      i++
    }
    const embed: Partial<MessageEmbed> = {
      color: 0x2F3136,
      title: drink.strDrink,
      thumbnail: {
        url: drink.strDrinkThumb
      },
      fields: [
        {
          name: 'Category',
          value: drink.strCategory,
          inline: true
        },
        {
          name: 'Glass',
          value: drink.strGlass,
          inline: true
        },
        {
          name: 'Alcoholic?',
          value: drink.strAlcoholic,
          inline: true
        },
        {
          name: 'Ingredients',
          value: ingredients.join('\n'),
          inline: false
        },
        {
          name: 'Instructions',
          value: drink.strInstructions,
          inline: false
        }
      ],
      footer: { text: 'powered by thecocktaildb.com' }
    }
    return { embeds: [ embed ] }
  } catch (e) {
    return { content: 'An error occured' }
  }
}

async function meal(): Promise<InteractionApplicationCommandCallbackData> {
  const url = 'https://www.themealdb.com/api/json/v1/1/random.php'
  try {
    const { data: o } = await axios.get(url)
    if (!o || !o.meals || !o.meals.length) {
      return {
        title: 'Couldn\'t load the meal list!',
        description: 'Maybe just get yourself some bread or something.'
      }
    }
    const meal = o.meals[0]

    const ingredients = []
    let i = 1
    while (meal['strIngredient' + i]) {
      ingredients.push(`${meal['strMeasure' + i]} **${meal['strIngredient' + i]}**`)
      i++
    }
    const embed: Partial<MessageEmbed> = {
      color: 0x2F3136,
      title: meal.strMeal,
      thumbnail: {
        url: meal.strMealThumb
      },
      fields: [
        {
          name: 'Category',
          value: meal.strCategory,
          inline: true
        },
        {
          name: 'Area',
          value: meal.strArea,
          inline: true
        },
        {
          name: 'Ingredients',
          value: ingredients.join('\n').substr(0, 1024),
          inline: false
        },
        {
          name: 'Instructions',
          value: meal.strInstructions.substr(0, 1024),
          inline: false
        }
      ],
      footer: { text: 'powered by themealdb.com' }
    }
    return { embeds: [ embed ] }
  } catch (e) {
    return { content: 'An error occured' }
  }
}


/*
 * DATA
 */

const jokes = [
  'Why did the opera singer go sailing? She wanted to hit the high Cs.',
  'What washes up on very small beaches? Micro-waves.',
  'Where do Volkswagens go when they get old? The old Volks home.',
  'What kind of music do mummies listen to? Wrap music.',
  "Why are teddy bears never hungry? Because they're always stuffed.",
  "Did you hear about the population of Ireland's capital? It's Dublin.",
  'When do doctors get mad? When they run out of patients.',
  'What has a face and two hands, but no arms or legs? A clock.',
  "Why is corn such a good listener? Because it's all ears.",
  'How does a rancher keep track of his cattle? With a cow-culator.',
  "What did the chip say when he saw the cheese stealing? Hey, that's Nachos.",
  'What do you call an unpredictable camera? A loose Canon.',
  'When is the best time to go to the dentist? Tooth-hurty!',
  'I used to have a job collecting leaves. I was raking it in.',
  'When is a car not a car? When it turns into a street.',
  "What's brown and sticky? A stick.",
  "What's a bear with no teeth called? A gummy bear.",
  'Why did the barber win the race? He knew a shortcut.',
  'Why did the tree go to the dentist? It needed a root canal.',
  'What kind of lion never roars? A dande-lion!',
  "Why were the teacher's eyes crossed? She couldn't control her pupils.",
  "What did the red light say to the green light? Don't look, I'm changing.",
  "Why can't your nose be 12 inches long? Because then it'd be a foot.",
  'What do lawyers wear to court? Lawsuits.',
  'What do you call a person who tells dad jokes but has no kids? A faux pa.',
  'How many tickles does it take to get an octopus to laugh? Ten-tickles.',
  'Why did the cookie go to the doctor? It was feeling crumb-y.',
  'What has four wheels and flies? A garbage truck.',
  'What did the football coach say to the broken vending machine? Give me my quarterback.',
  'What do you get when you cross a snake with a pie? A pie-thon!',
  'Why did the melon jump into the lake? It wanted to be a water-melon.',
  'What do you call crystal clear urine? 1080pee.',
  'What did the buffalo say to his kid when he dropped him off at school? Bi-son.',
  'What do a dog and a phone have in common? They both have collar ID.',
  'What do you call a baby monkey? A chimp off the old block.',
  "Why is your nose in the middle of your face? Because it's the scenter.",
  'What do you call a pile of cats? A meow-ntain.',
  'What runs around a yard without actually moving? A fence.',
  'Put the cat out? I didn’t know it was on fire.',
  'What do you get when you cross a snowman with a vampire? Frostbite.',
  'What did the fisherman say to the magician? Pick a cod, any cod.',
  'When does a joke become a dad joke? When the punch line becomes apparent.',
  "Why can't you trust the king of the jungle? Because he's always lion.",
  'What do you call someone who dresses up like a noodle? An impasta!',
  "Why couldn't the toilet paper cross the road? Because it got stuck in a crack.",
  'When does Friday come before Thursday? In the dictionary.',
  "Why couldn't the bad sailor learn his alphabet? Because he always got lost at C.",
  'What disease do you get when you put up the Christmas decorations? Tinselitus.',
  "What's the difference between America and a memory stick? One's USA and the other's USB.",
  'What lies at the bottom of the sea shaking? A nervous wreck.',
  "Why couldn't the pony sing? Because she was a little hoarse.",
  "Why do seagulls fly over the sea? Because if they flew over the bay they'd be called bagels.",
  'What do you call someone who plays tricks on Halloween? Prankenstein.',
  'What do you call a funny mountain? Hill-arious!',
  'What do you call a sleeping bull? A bull-dozer.',
  'The inventor of the throat lozenge has died. There will be no coffin at his funeral.',
  "Why wouldn't the shrimp share his food? Because he was a little shellfish.",
  "What did the first plate say to the second plate? Dinner's on me.",
  'Why did the chicken get a penalty? For fowl play.',
  'Sorry, I was all up in your grill about cooking yesterday.',
  'How do you make a Venetian blind? Poke him in the eyes.',
  'What do prisoners use to call each other? Cell phones.',
  "What did the first street say to the second street? I'll meet you at the intersection.",
  'Where do hamburgers go to dance? They go to the meat-ball.',
  "What's E.T. short for? He's got little legs.",
  "What do you call a T-Rex that's been beaten up? Dino-sore.",
  'Why did the scientist take out his doorbell? He wanted to win the no-bell prize.',
  'What comes down, but never comes up? Rain.',
  'What do you call a group of disorganized cats? A cat-tastrophe.',
  'Have you heard the joke about paper? Good that you haven’t, it’s tearable!',
  'What do you call cheese that is not yours? Nacho cheese!',
  'What happens if a frog parks illegally? They get toad.',
  'What would bears be without bees? Ears.',
  "What's a didgeridoo? Whatever it wants to.",
  "What did one eye say to the other eye? Don't look now, but something between us smells.",
  'How does a squid go into battle? Well armed.',
  "How much did the pirate's new earrings cost him? A buccaneer!",
  'An Italian chef has died. He pasta way.',
  'How much does a pirate pay for corn? A buccaneer.',
  'What musical instrument is found in the bathroom? A tube-a toothpaste.',
  'Long wait to see the doctor? Be patient.',
  "What's an astronaut's favorite part of a computer? The space bar.",
  'Which side of a duck has the most feathers? The outside.',
  'What did the digital clock say to the grandfather clock? Look, grandpa! No hands!',
  "Why did the mobile phone need glasses? It lost all it's contacts.",
  "What's the worst thing about throwing a party in space? You have to planet.",
  'What did the calculator say to the math student? You can count on me.',
  'What does a nut say when it sneezes? Cashew.',
  'Where do beef burgers go to dance? The meatball.',
  'Which U.S. state has the smallest soft drinks? Minne-sota',
  'Why did the golfer wear two pairs of pants? In case he got a hole in one.',
  "What can be broken, but can't be held? A promise.",
  "I'll do algebra, tackle geometry, maybe even a little calculus… But graphing is where I draw the line.",
  "What's a snake's favorite subject? Hisstory.",
  "Why did the policeman go to the baseball game? He'd heard that someone had stolen a base!",
  'How do you stop moles digging in your garden? Hide the spade.',
  'What do you call a shoe made out of a banana? A slipper.',
  "What did the policeman say to his belly button? You're under a vest.",
  'To the guy who invented the zero… Thanks for nothing.',
  'Hate your haircut? Don’t worry, it’ll grow on you.',
  'What gets wetter the more it dries? A towel.',
  'How do you make a Swiss roll? Push him down a mountain.',
  'Why did the pig get hired by the restaurant? He was really good at bacon.',
  'What never asks questions, but is often answered? A doorbell.',
  'Why did the teacher wear sunglasses inside? Her students were so bright!',
  'Why could the bee not hear what people were saying? He had wax in his ears.',
  'Did you hear about the sensitive burglar. He takes things personally.',
  'What do elves learn at school? The elf-abet.',
  'I drew up plans for Duckingham Palace, but I can’t find them. So I guess we’ll just have to ‘wing’ it.',
  "When is a door not a door? When it's a-jar.",
  'Why was the sand wet? Because the sea weed.',
  'Why can’t two elephants go swimming? Because they only have one pair of trunks.',
  'What do you call anxious dinosaurs? Nervous Rex.',
  'What do you call bees that produce milk? Boo-bees.',
  "What has a bed that you can't sleep in? A river.",
  'Why did the banana go to the hospital? He was peeling really bad.',
  "How do you know when the moon has had enough to eat? When it's full.",
  "What did the swordfish say to the marlin? You're looking sharp.",
  'How long does it take to make butter? An echurnity!',
  "Why was the student's report card wet? It was below C level!",
  "What is a cheerleader's favorite drink? Root beer.",
  'How does the ocean say hello? It waves.',
  "What's an astronaut's favorite candy? A Mars bar.",
  'Why is there a wall around the cemetery? Because people are dying to get in.',
  "What's the most musical part of the chicken? The drumstick.",
  "What do call it when you help a lemon that's in trouble? Lemon-aid.",
  'What kind of shoes do ninjas wear? Sneakers',
  'What kind of music do planets listen to? Nep-tunes.',
  "Why do cows wear bells? Because their horns don't work.",
  'How do you impress a female baker? Bring her flours.',
  "What did the big chimney say to the little chimney? You're too young to smoke.",
  'What do you call an alligator in a vest? An investigator!',
  'What do Olympic sprinters eat before a race? Nothing. They fast.',
  "When is a door not a door? When it's ajar.",
  'Why did the cookie go to the doctors? Because he felt crummy.',
  "Why couldn't the bike stand up? It was too tired.",
  "What's the best time to go to the dentist? Tooth hurty.",
  'What kind of dinosaur loves to sleep? A stega-snore-us.',
  'What did the tree say to the wind? Leaf me alone!',
  "Why don't penguins like talking to strangers at parties? They find it hard to break the ice.",
  'Why did Santa study music at college? To improve his rapping skills.',
  "What kind of button doesn't unbutton? A belly button.",
  'What do you call a boat with a hole in the bottom? A sink.',
  'Where do you learn to make banana splits? At sundae school.',
  "What did the baby corn say to the mama corn? Where's pop corn?",
  "Have you heard about the pregnant bed bug? She's going to have her baby in the spring.",
  'A guy walked into a bar… And was disqualified from the limbo contest.',
  'Why did the computer go to the doctor? It had a virus.',
  'What rhymes with orange? No it doesn’t.',
  "What did the mayonnaise say when the refrigerator door was opened? Close the door, I'm dressing.",
  'Why did the boy bring the ladder to school? He was going to high school.',
  'How do you stop a bull from charging? Cancel its credit card.',
  'Why did the bicycle fall over? Because it was two tired.',
  'Why did the tomato turn red? It saw the salad dressing.',
  'Why did the chicken cross the playground? To get to the other slide.',
  "What's a skeleton's favorite musical instrument? The trom-bone.",
  "Why do moon rocks taste better than earth rocks? Because they're meteor.",
  "What's orange and sounds like a parrot? A carrot.",
  'How do billboards talk? Sign language.',
  'Why do bananas wear sun cream? To stop them from peeling.',
  "Why couldn't the sesame seed leave the casino? Because he was on a roll.",
  "A cowboy rides into town on Friday, stays for three days, then leaves on Friday. How did he do it? His horse's name was Friday.",
  'Why was the math book sad? Because it had so many problems.',
  'What did the axe murderer say to the judge? It was an axe-ident.',
  'How many lips does a flower have? Tu-lips.',
  'What did one toilet say to the other toilet? You look flushed.',
  "What's Forrest Gump’s Gmail password? 1forrest1",
  "Why can't you trust atoms? They make up everything!",
  'Why did the drum take a nap? It was beat.',
  'Where do sheep go to get their hair cut? The baa-baa shop.',
  "What did the triangle say to the circle? You're pointless.",
  'What did the 0 say to the 8? Nice belt!',
  'What three candies can you find in every school? Nerds, DumDums, and Smarties.',
  'Why did the poor man sell yeast? To raise some dough.',
  'Why did the stadium get hot after the game? All the fans left.',
  'What creature is smarter than a talking parrot? A spelling bee.',
  "Most comedians are good, trustworthy people. Yep, they're a bunch of stand-up guys.",
  "What did the hat say to the scarf? You go ahead, I'll hang around.",
  'What did one penny say to another penny? We make cents.',
  'Everyone has it, and no one can lose it. What is it? A shadow.',
  "Why shouldn't you play cards on the savannah? Because of all the cheetahs.",
  "It's Jamaican hairstyle day at work tomorrow. I'm dreading it.",
  'Where do pencils go on vacation? Pencil-vania.',
  'Where do cows go for entertainment? The mooooo-vies!',
  'How much does a Mustang cost? More than you can af-Ford.',
  'How do snails fight? They slug it out.',

  'Joe',
  'Game of Thrones Season 8',
  'ur mom'
]

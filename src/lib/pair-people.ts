/* eslint-disable no-labels */

import { shuffleArray } from './utils/array-utils'


type Dict = Record<string, string>


function tryOptimal(people: string[], wishes: Dict): Dict | null {
  const assignments: Dict = {}
  const alreadyDecided = []

  for (const from in wishes) {
    const to = wishes[from]
    if (alreadyDecided.includes(to)) return null
    assignments[from] = to
    alreadyDecided.push(to)
  }

  if (alreadyDecided.length === people.length) return assignments

  nextIteration:
  while (alreadyDecided.length !== people.length) {
    const whoIsAvailable: Record<string, string[]> = {}

    // go through all people and find possible assignments that are still valid
    for (const person of people) {
      if (assignments[person]) continue
      const left = []
      for (const target of people) {
        if (target === person) continue
        if (alreadyDecided.includes(target)) continue
        left.push(target)
      }
      if (left.length === 0) return null // none left for this person -> no solution
      whoIsAvailable[person] = left
    }

    for (const person in whoIsAvailable) {
      if (whoIsAvailable[person].length > 1) continue
      assignments[person] = whoIsAvailable[person][0]
      alreadyDecided.push(whoIsAvailable[person][0])
      continue nextIteration
    }

    const peopleLeft = Object.keys(whoIsAvailable)
    const selected = peopleLeft[~~(Math.random() * peopleLeft.length)]
    const target = whoIsAvailable[selected][~~(Math.random() * whoIsAvailable[selected].length)]

    assignments[selected] = target
    alreadyDecided.push(target)
  }

  return assignments
}

export function pairPeople(people: string[], wishes: Dict): Dict {
  let solution = tryOptimal(people, wishes)
  if (solution) return solution

  const peopleWithWishes = shuffleArray(Object.keys(wishes))

  for (const person of peopleWithWishes) {
    const copy = { ...wishes }
    delete copy[person]
    solution = tryOptimal(people, copy)
    if (solution) return solution
  }

  // no? then completely random please
  return tryOptimal(people, {})
}

export function testPairPeople() {
  const people = [
    'jake',
    'brian',
    'oliver',
    'hann',
    'susan',
    'andi'
  ]

  const wishes = {
    jake: 'susan',
    oliver: 'susan',
    andi: 'hann',
    hann: 'andi'
  }

  const print = (o: any) => console.log(o ? Object.entries(o).map(([ k, v ]) => `${k} -> ${v}`).join('   ') : 'null')

  print(pairPeople(people, wishes))
  print(pairPeople(people, wishes))
  print(pairPeople(people, wishes))
  print(pairPeople(people, wishes))
  print(pairPeople(people, wishes))

  let f = 0
  for (let i = 0; i < 200; i++)
    if (!pairPeople(people, wishes)) f++
  console.log(`Found null in ${f} of ${200} instances`)


  process.exit(0)
}


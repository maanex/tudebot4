

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffleArray<T>(t: T[]): T[] {
  let currentIndex = t.length
  let randomIndex

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--;

    [ t[currentIndex], t[randomIndex] ] = [ t[randomIndex], t[currentIndex] ]
  }

  return t
}

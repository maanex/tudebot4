/* eslint-disable no-return-assign */
/* eslint-disable no-extend-native */


export class Util {

  public static init() {
    Object.defineProperties(Array.prototype, {
      stack: {
        value() {
          let out = 0
          this.forEach(e => out += e)
          return out
        }
      },
      count: {
        value(counter: (index) => number) {
          let out = 0
          this.forEach(e => out += counter(e))
          return out
        }
      },
      iterate: {
        value(counter: (index, current) => number) {
          let out
          this.forEach(e => out = counter(e, out))
          return out
        }
      }
    })
  }

}


export const rand = max => Math.floor(Math.random() * max)



export class Util {
    
    private constructor() {}

    public static init() {
        Object.defineProperties(Array.prototype, {
            stack: {
                value: function() {
                    let out = 0;
                    this.forEach(e => out += e);
                    return out;
                }
            },
            count: {
                value: function(counter: (index) => number) {
                    let out = 0;
                    this.forEach(e => out += counter(e));
                    return out;
                }
            }
        });
    }

}


export let rand = max => Math.floor(Math.random() * max);
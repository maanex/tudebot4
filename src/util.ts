

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
            }
        });
    }

}


export let rand = max => Math.floor(Math.random() * max);
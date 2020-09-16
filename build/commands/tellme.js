"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const types_1 = require("../types/types");
const emojis_1 = require("../int/emojis");
const Jimp = require("jimp");
const fetch = require('node-fetch');
class TellmeCommand extends types_1.Command {
    constructor() {
        super({
            name: 'tellme',
            aliases: [],
            description: 'Tell me my future',
            groups: ['fun', 'rng'],
        });
    }
    execute(channel, user, args, event, repl) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            try {
                let num = parseInt(user.id);
                num /= (10 ** `${num}`.length);
                const imgBuffer = yield TellmeCommand.run(yield TellmeCommand.getUrl(num));
                const file = new discord_js_1.Attachment(imgBuffer, user.username.toLowerCase() + '.png');
                const embed = new discord_js_1.RichEmbed()
                    .attachFile(file)
                    .setColor(0x2f3136)
                    .setImage(`attachment://${user.username.toLowerCase()}.png`);
                channel.send('', { embed });
                resolve(true);
            }
            catch (ex) {
                channel.send({ embed: {
                        color: 0x2f3136,
                        description: `${emojis_1.default.BIG_SPACE}\n\n${emojis_1.default.BIG_SPACE} ${emojis_1.default.BIG_SPACE} ${emojis_1.default.BIG_SPACE} - ${emojis_1.default.BIG_SPACE} ${emojis_1.default.BIG_SPACE} ${emojis_1.default.BIG_SPACE}\n\n${emojis_1.default.BIG_SPACE}`
                    } });
                resolve(false);
            }
        }));
    }
    static run(url) {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const outsize = 256;
            Jimp.read(url)
                .then(input => {
                new Jimp(256, 256, 0x000000, (err, white) => {
                    if (err)
                        throw err;
                    if (Jimp.distance(input, white) < .3)
                        input.invert();
                    new Jimp(outsize, outsize, (err, out) => {
                        if (err)
                            throw err;
                        for (let x = 1; x < outsize; x++) {
                            for (let y = 1; y < outsize; y++) {
                                const orgX = input.getWidth() / outsize * x;
                                const orgY = input.getHeight() / outsize * y;
                                let color = this.removeLast8Bit(input.getPixelColor(orgX, orgY));
                                const orgY2 = input.getHeight() / outsize * (y - 1);
                                const color2 = this.removeLast8Bit(input.getPixelColor(orgX, orgY2));
                                const orgX3 = input.getWidth() / outsize * (x - 1);
                                const color3 = this.removeLast8Bit(input.getPixelColor(orgX3, orgY));
                                let contrast = ~~((this.getContrast(color, color2) * this.getContrast(color, color3)) / 2);
                                color = this.removeLast8Bit(input.getPixelColor(orgX, orgY - (input.getHeight() / outsize * Math.min(y, contrast / 10))));
                                const vignette = 1 - Math.sqrt((outsize / 2 - x) ** 2 + (outsize / 2 - y) ** 2) / Math.sqrt(2 * ((outsize / 2) ** 2));
                                // contrast *= this.colorRamp(vignette);
                                // if (contrast > 230) contrast = 230;
                                // if (contrast < 15) contrast = 15;
                                contrast = vignette * 255;
                                const hexR = (~~(this.colorRamp(((color >> 16) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0');
                                const hexG = (~~(this.colorRamp(((color >> 8) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0');
                                const hexB = (~~(this.colorRamp(((color >> 0) & 0b11111111) * contrast / 255))).toString(16).padStart(2, '0');
                                out.setPixelColor(parseInt(hexG + hexB + hexR + 'ff', 16), x, y);
                            }
                        }
                        // if (Math.random() < .5) out.invert();
                        out.sepia();
                        out.posterize(10);
                        for (let x = 1; x < outsize; x++) {
                            for (let y = 1; y < outsize; y++) {
                                const color = this.removeLast8Bit(out.getPixelColor(x, y));
                                const g = Math.min(((color >> 8) & 0b11111111) + 48, 255);
                                const r = Math.min(((color >> 16) & 0b11111111) + 46, 255);
                                const b = Math.min(((color >> 0) & 0b11111111) + 53, 255);
                                out.setPixelColor(parseInt(r.toString(16) + g.toString(16) + b.toString(16) + 'ff', 16), x, y);
                            }
                        }
                        // out.write('./tmp/out.png');
                        out.getBuffer(Jimp.MIME_PNG, (err, res) => {
                            if (err)
                                reject();
                            else
                                resolve(res);
                        });
                    });
                });
            })
                .catch(err => {
                reject();
                // if (err) throw err;
            });
        }));
    }
    static colorRamp(input) {
        let t = input, b = 0, c = 255, d = 255;
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    }
    static removeLast8Bit(number) {
        return parseInt(number.toString(16).padStart(8, '0').substr(0, 6), 16);
    }
    static getUrl(num) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield fetch('http://pd.tude.ga/imgdb.json');
            if (!res)
                return '';
            const o = yield res.json();
            if (!o)
                return '';
            return o[Math.floor(num * o.length)];
        });
    }
    static getContrast(color1, color2) {
        const c1r = (color1 >> 16) & 0b11111111;
        const c1g = (color1 >> 8) & 0b11111111;
        const c1b = (color1 >> 0) & 0b11111111;
        const c2r = (color2 >> 16) & 0b11111111;
        const c2g = (color2 >> 8) & 0b11111111;
        const c2b = (color2 >> 0) & 0b11111111;
        const c1cont = (299 * c1r + 587 * c1g + 114 * c1b) / 1000;
        const c2cont = (299 * c2r + 587 * c2g + 114 * c2b) / 1000;
        return Math.abs(c1cont - c2cont);
    }
}
exports.default = TellmeCommand;
//# sourceMappingURL=tellme.js.map
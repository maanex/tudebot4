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
const Jimp = require("jimp");
function generateInviteLinkMeme(username) {
    return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
        Jimp.read('./assets/img/invite_link_meme_1.png')
            .then((img) => __awaiter(this, void 0, void 0, function* () {
            const font = yield Jimp.loadFont('./assets/fonts/montserrat.fnt');
            img.print(font, 7, 4, username + ':', 500);
            img.getBuffer(Jimp.MIME_PNG, (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
        }))
            .catch(err => {
            reject(err);
        });
    }));
}
exports.default = generateInviteLinkMeme;
//# sourceMappingURL=generateInviteLinkMeme.js.map
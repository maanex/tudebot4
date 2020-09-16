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
const item_1 = require("../../thirdparty/tudeapi/item");
const tudeapi_1 = require("../../thirdparty/tudeapi/tudeapi");
const index_1 = require("../../index");
class Letter extends item_1.ExpandedItem {
    constructor(prefab, id, title, text, author) {
        super(prefab, id, {
            title: title,
            text: text,
            author: author
        });
    }
    renderMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.written
                ? [{
                        name: 'Author',
                        value: (yield this.getAuthor()).user.name
                    }, {
                        name: 'Text',
                        value: this.text
                    }]
                : [{
                        name: 'Empty',
                        value: `Write on this letter using \`use ${this.id}\``
                    }];
        });
    }
    use(mes, repl, u) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.written) {
                repl(this.title, 'message', this.text, { footer: `Written by ${(yield this.getAuthor()).user.name}` });
            }
            else {
                const cmdMod = index_1.TudeBot.getModule('commands');
                repl('Wanna write something on this letter?', 'message', 'Sure, go ahead. Just type the text in the chat. Write `cancel` if you change your mind!');
                cmdMod.awaitUserResponse(mes.author, mes.channel, 10 * 60 * 1000, (reply) => {
                    if (!reply)
                        return;
                    if (reply.content.toLowerCase() == 'cancel') {
                        repl('No text, okay :(');
                        return;
                    }
                    const text = reply.content;
                    repl('Fabulous!', 'message', 'Now I just need a title for this masterpiece.');
                    cmdMod.awaitUserResponse(mes.author, mes.channel, 10 * 60 * 1000, (reply2) => {
                        if (!reply)
                            return;
                        if (reply.content.toLowerCase() == 'cancel') {
                            repl('Aight, see you later!');
                            return;
                        }
                        const title = reply2.content;
                        this.author = u.id;
                        this.title = title,
                            this.text = text;
                        tudeapi_1.default.updateClubUser(u);
                        repl('Wonderfull!', 'message', 'Your letter is written!');
                    });
                });
            }
        });
    }
    //
    get written() {
        return !!this.author;
    }
    get author() {
        return this.meta.author;
    }
    set author(id) {
        this.meta.author = id;
        if (!this.metaChanges)
            this.metaChanges = {};
        this.metaChanges.author = id;
    }
    getAuthor() {
        return __awaiter(this, void 0, void 0, function* () {
            return tudeapi_1.default.clubUserById(this.author);
        });
    }
    get text() {
        return this.meta.text;
    }
    set text(text) {
        this.meta.text = text;
        if (!this.metaChanges)
            this.metaChanges = {};
        this.metaChanges.text = text;
    }
    get title() {
        return this.meta.title;
    }
    set title(title) {
        this.meta.title = title;
        if (!this.metaChanges)
            this.metaChanges = {};
        this.metaChanges.title = title;
    }
    get name() {
        return this.title || 'Blank Letter';
    }
}
exports.default = Letter;
//# sourceMappingURL=letter.js.map
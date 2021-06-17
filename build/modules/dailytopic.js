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
const cron = require("cron");
const axios_1 = require("axios");
const types_1 = require("../types/types");
const index_1 = require("../index");
class DailyTopicModule extends types_1.Module {
    constructor(conf, data, guilds, lang) {
        super('Daily Topic', 'public', conf, data, guilds, lang);
        this.lastDay = '';
        //
        this.topics = {
            dayfact: () => __awaiter(this, void 0, void 0, function* () {
                const { data } = yield axios_1.default.get(`http://numbersapi.com/${new Date().getMonth() + 1}/${new Date().getDate()}/date`);
                return data;
            })
        };
    }
    onEnable() {
        // TODO enable below for non debug
        // this.cronjob = cron.job('0 0 * * *', () => this.run())
        this.cronjob = cron.job('* * * * *', () => this.run());
        this.cronjob.start();
    }
    onBotReady() {
    }
    onDisable() {
        var _a;
        clearInterval(this.interval);
        this.interval = undefined;
        (_a = this.cronjob) === null || _a === void 0 ? void 0 : _a.stop();
    }
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const g of this.guilds.keys()) {
                const guild = index_1.TudeBot.guilds.resolve(g);
                if (!guild)
                    continue;
                const channel = guild.channels.resolve(this.guilds.get(g).channel);
                if (!channel || channel.type !== 'text')
                    continue;
                channel.send(yield this.generateTopic(g));
            }
        });
    }
    generateTopic(guildid) {
        // TODO save last week of topics in an array to not get the same kind of topic too many times in a row
        const kind = 'dayfact'; // findKind()
        return this.topics[kind]();
    }
}
exports.default = DailyTopicModule;
//# sourceMappingURL=dailytopic.js.map
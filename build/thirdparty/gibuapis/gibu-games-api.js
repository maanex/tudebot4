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
/* eslint-disable camelcase */
const axios_1 = require("axios");
const index_1 = require("../../index");
// #endregion
class GibuGamesApi {
    static getDetails(url) {
        return __awaiter(this, void 0, void 0, function* () {
            const apiUrl = `${index_1.config.thirdparty.gibuapis.endpoint}${this.ENDPOINT_URL}details?url=${encodeURIComponent(url)}`;
            console.log(apiUrl);
            const { data, status } = yield axios_1.default.get(apiUrl, {
                headers: { Authorization: index_1.config.thirdparty.gibuapis.key },
                validateStatus: null
            });
            if (status < 200 || status >= 300)
                return null;
            return data.data;
        });
    }
}
exports.default = GibuGamesApi;
GibuGamesApi.ENDPOINT_URL = '';
//# sourceMappingURL=gibu-games-api.js.map
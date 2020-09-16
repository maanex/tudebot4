"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const itemlist_1 = require("./itemlist");
class ProfileSkin {
    constructor(item, settings) {
        var _a, _b, _c;
        this._item = item;
        this._id = (_b = (_a = item) === null || _a === void 0 ? void 0 : _a.id, (_b !== null && _b !== void 0 ? _b : ''));
        this.emblemSet = ((_c = settings) === null || _c === void 0 ? void 0 : _c.emblemSet) || 'DEFAULT';
    }
    //
    get item() { return this._item; }
    get id() { return this._id; }
}
exports.ProfileSkin = ProfileSkin;
ProfileSkin.DEFAULT = new ProfileSkin(null);
ProfileSkin.BLUE = new ProfileSkin(itemlist_1.Items.ProfileSkinBlue, { emblemSet: 'MONOCHROME' });
//# sourceMappingURL=profileskins.js.map
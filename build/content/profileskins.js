"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileSkin = void 0;
const itemlist_1 = require("./itemlist");
let ProfileSkin = /** @class */ (() => {
    class ProfileSkin {
        constructor(item, settings) {
            var _a;
            this._item = item;
            this._id = (_a = item === null || item === void 0 ? void 0 : item.id) !== null && _a !== void 0 ? _a : '';
            this.emblemSet = (settings === null || settings === void 0 ? void 0 : settings.emblemSet) || 'DEFAULT';
        }
        //
        get item() { return this._item; }
        get id() { return this._id; }
    }
    ProfileSkin.DEFAULT = new ProfileSkin(null);
    ProfileSkin.BLUE = new ProfileSkin(itemlist_1.Items.ProfileSkinBlue, { emblemSet: 'MONOCHROME' });
    return ProfileSkin;
})();
exports.ProfileSkin = ProfileSkin;
//# sourceMappingURL=profileskins.js.map
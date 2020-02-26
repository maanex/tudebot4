"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tudeapi_1 = require("./tudeapi");
class ItemCategory {
    constructor(id) {
        this.id = id;
    }
    get name() { return tudeapi_1.default.clubLang['itemcat_' + this.id]; }
    get namepl() { return tudeapi_1.default.clubLang['itemcatpl_' + this.id]; }
    getName(amount) { return amount == 1 ? this.name : this.namepl; }
}
exports.ItemCategory = ItemCategory;
//
ItemCategory.SYSTEM = new ItemCategory('system');
ItemCategory.FISHING = new ItemCategory('fishing');
ItemCategory.COLLECTABLE = new ItemCategory('collectable');
class ItemGroup {
    constructor(id) {
        this.id = id;
    }
    get name() { return tudeapi_1.default.clubLang['itemgroup_' + this.id]; }
    get namepl() { return tudeapi_1.default.clubLang['itemgrouppl_' + this.id]; }
    getName(amount) { return amount == 1 ? this.name : this.namepl; }
}
exports.ItemGroup = ItemGroup;
//
ItemGroup.CURRENCY = new ItemGroup('currency');
ItemGroup.LOOTBOX = new ItemGroup('lootbox');
ItemGroup.COLLECTABLE = new ItemGroup('collectable');
ItemGroup.GAME_ASSET = new ItemGroup('gameasset');
//# sourceMappingURL=tapi.int.js.map
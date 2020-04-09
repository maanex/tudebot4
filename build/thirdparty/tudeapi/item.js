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
ItemCategory.UNDEFINED = new ItemCategory('undefined');
ItemCategory.SYSTEM = new ItemCategory('system');
ItemCategory.FISHING_EQUIPMENT = new ItemCategory('fishing_assets');
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
ItemGroup.UNDEFINED = new ItemGroup('undefined');
ItemGroup.CURRENCY = new ItemGroup('currency');
ItemGroup.LOOTBOX = new ItemGroup('lootbox');
ItemGroup.COLLECTABLE = new ItemGroup('collectable');
ItemGroup.GAME_ASSET = new ItemGroup('gameasset');
class Item {
    constructor(prefab, id, _amount, _meta = undefined) {
        this.prefab = prefab;
        this.id = id;
        this._amount = _amount;
        this._meta = _meta;
        this.metaChanges = undefined;
    }
    ;
    set amount(amount) { this._amount = amount; }
    get amount() { return this._amount; }
    set meta(meta) { this._meta = meta; this.metaChanges = meta; }
    get meta() { return this._meta; }
    get name() {
        return tudeapi_1.default.clubLang[(this.amount == 1 ? 'item_' : 'itempl_') + this.prefab.id];
    }
}
exports.Item = Item;
class StackableItem extends Item {
    constructor(prefab, amount) {
        super(prefab, prefab.id, amount, undefined);
    }
    ;
    set meta(meta) {
        console.trace(`Attempted to change meta on a non-extended item. ${this.prefab.id}`);
    }
    get meta() { return undefined; }
}
exports.StackableItem = StackableItem;
class ExpandedItem extends Item {
    constructor(prefab, id, meta) {
        super(prefab, id, 1, meta);
    }
    ;
    set amount(amount) {
        if (amount == 0)
            this._amount = 0;
        else
            this._amount = 1;
    }
    get amount() { return this._amount; }
}
exports.ExpandedItem = ExpandedItem;
//# sourceMappingURL=item.js.map
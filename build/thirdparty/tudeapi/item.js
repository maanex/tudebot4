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
class Item {
    constructor(id, type, amount, category, group, expanded, tradeable, sellable, purchaseable, icon, meta = undefined, _isDef = false) {
        this.id = id;
        this.type = type;
        this.amount = amount;
        this.category = category;
        this.group = group;
        this.expanded = expanded;
        this.tradeable = tradeable;
        this.sellable = sellable;
        this.purchaseable = purchaseable;
        this.icon = icon;
        this.meta = meta;
        this._isDef = _isDef;
    }
    ;
    get name() {
        return tudeapi_1.default.clubLang[(this.amount == 1 ? 'item_' : 'itempl_') + this.id];
    }
}
exports.Item = Item;
class StackableItem extends Item {
    constructor(type, amount, category, group, tradeable, sellable, purchaseable, icon, _isDef = false) {
        super(type, type, amount, category, group, false, tradeable, sellable, purchaseable, icon, undefined, _isDef);
    }
    ;
    set amount(amount) {
        this['amount'] = amount;
    }
}
exports.StackableItem = StackableItem;
class ExpandedItem extends Item {
    constructor(id, type, category, group, tradeable, sellable, purchaseable, icon, meta = {}, _isDef = false) {
        super(id, type, 1, category, group, true, tradeable, sellable, purchaseable, icon, meta, _isDef);
    }
    ;
}
exports.ExpandedItem = ExpandedItem;
//# sourceMappingURL=item.js.map
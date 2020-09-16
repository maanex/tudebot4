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
class GenericFish extends item_1.ExpandedItem {
    constructor(prefab, id, size, caughtAt, stuffed) {
        super(prefab, id, {
            size: size,
            caughtAt: caughtAt,
            stuffed: stuffed
        });
    }
    renderMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            return [
                {
                    name: 'Size',
                    value: this.size.toFixed(2) + 'm'
                },
                {
                    name: 'Caught at',
                    value: this.caughtAt
                },
            ];
        });
    }
    //
    get name() {
        return (this.stuffed ? 'Stuffed ' : '') + super.name;
    }
    get size() {
        return this.meta.size;
    }
    set size(size) {
        this.meta.size = size;
        if (!this.metaChanges)
            this.metaChanges = {};
        this.metaChanges.size = size;
    }
    get caughtAt() {
        return new Date(this.meta.caughtAt * 1000);
    }
    set caughtAt(time) {
        this.meta.caughtAt = time.getMilliseconds() / 1000;
        if (!this.metaChanges)
            this.metaChanges = {};
        this.metaChanges.size = this.meta.caughtAt;
    }
    get stuffed() {
        return this.meta.stuffed;
    }
    set stuffed(stuffed) {
        this.meta.stuffed = stuffed;
        if (!this.metaChanges)
            this.metaChanges = {};
        this.metaChanges.stuffed = stuffed;
    }
}
exports.default = GenericFish;
//# sourceMappingURL=generic-fish.js.map
# Inventory system

item {
    id: string; für icons und so
    name: string; display name
    cat: string; category for e.g. bulk selling
    type: item type, unlike category, e.g. lootbox
    am?: number; amount of this item, null treated as 1
    meta?: object; item dependend, null equals no data
}


## item storage:
2. inventar um das inventar clean zu halten
mit dispose und withdraw items ins storage / raus holen


## settings:
- fishing items: • direkt verkaufen   • ins inventar   • ins storage
- 



## database

> inside user object
inventory: {
    fishing_rod: { }, // default amount is 1
    stone: {
        amount: 15 // with amount specified
    },
    _awda: { // an "expanded item", an item of which multiple copies with different item meta can exist. the id always starts with a _ followed by 4 random alphabetic characters 
        type: "carp", // the item's type (since it can't have that as it's key)
        meta: { // itemdata
            ...
        }
    }
}

> in item list collection
{
    _id: string, // uuid, lowercase, _ as space
    cat: string, // can be empty
    type: string,
    prop: number // binary boolean array for: 1 - expanded (if it's an expanded item, expanded items can hold item meta, can exist in multiple instances within one container and are stored differently in the user's data)
                                              2 - tradeable (also includes selling on user market)
                                              4 - sellable (only includes the bank, not to other users)
                                              8 - purchaseable (if the item is theoretically purchaseable in the bank shop)


}
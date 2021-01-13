/* eslint-disable require-await */
import { ExpandedItem, ItemPrefab } from '../../thirdparty/tudeapi/item'


export default class GenericFish extends ExpandedItem {

  constructor(prefab: ItemPrefab, id: string, size: number, caughtAt: Date, stuffed: boolean) {
    super(prefab, id, {
      size,
      caughtAt,
      stuffed
    })
  }

  async renderMetadata() {
    return [
      {
        name: 'Size',
        value: this.size.toFixed(2) + 'm'
      },
      {
        name: 'Caught at',
        value: this.caughtAt
      }
    ]
  }

  //

  public get name() {
    return (this.stuffed ? 'Stuffed ' : '') + super.name
  }

  public get size(): number {
    return this.meta.size
  }

  public set size(size: number) {
    this.meta.size = size
    if (!this.metaChanges) this.metaChanges = {}
    this.metaChanges.size = size
  }

  public get caughtAt(): Date {
    return new Date(this.meta.caughtAt * 1000)
  }

  public set caughtAt(time: Date) {
    this.meta.caughtAt = time.getMilliseconds() / 1000
    if (!this.metaChanges) this.metaChanges = {}
    this.metaChanges.size = this.meta.caughtAt
  }

  public get stuffed(): boolean {
    return this.meta.stuffed
  }

  public set stuffed(stuffed: boolean) {
    this.meta.stuffed = stuffed
    if (!this.metaChanges) this.metaChanges = {}
    this.metaChanges.stuffed = stuffed
  }

}

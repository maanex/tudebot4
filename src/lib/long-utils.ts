import { Long } from 'mongodb'


export function removeLongFromArray(long: Long, array: Long[]): Long[] {
  return array.splice(array.findIndex(s => s.equals(long)))
}

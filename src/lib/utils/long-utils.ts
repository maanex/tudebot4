import { Long } from 'mongodb'


export function removeLongFromArray(long: Long, array: Long[]): Long[] {
  const index = array.findIndex(s => s.equals(long))
  return index >= 0 ? array.splice(index, 1) : array
}

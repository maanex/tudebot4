
declare interface Array<T> {
  stack(): T;
  count(counter: (index: number) => number): number;
  iterate(counter: (index: number, current: number) => number): number;
}


import { CellReactor } from "./reactor"
import { type Mem } from "./triad"


export function cell<T>(value: T): Mem<T> {
  const target = new CellReactor(value)
  return function (value?: T) {
    if (value !== undefined) {
      target.set(value)
      return value
    } else {
      return target.get()
    }
  }
}

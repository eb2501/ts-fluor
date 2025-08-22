import invariant from "tiny-invariant"
import type { Get, Mem } from "./basic"

export function view<T>(fnGet: () => T): Get<T>
export function view<T>(fnGet: () => T, fnSet: (value: T) => void): Mem<T>
export function view<T>(
  fnGet: () => T,
  fnSet?: (value: T) => void
): Get<T> | Mem<T> {
  if (fnSet === undefined) {
    invariant(fnGet !== undefined)
    const res = () => fnGet()
    Object.defineProperty(
      res,
      "type",
      { value: "get" }
    )
    return res as Get<T>
  } else {
    const res = (value?: T) => {
      if (value !== undefined) {
        fnSet(value)
        return value
      } else {
        return fnGet()
      }
    }
    Object.defineProperty(
      res,
      "type",
      { value: "mem" }
    )
    return res as Mem<T>
  }
}

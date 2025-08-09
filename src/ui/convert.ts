import { cell, type Get, type Mem, isGet, isMem } from "../core"

export type ToGet<T> = T | Get<T> | Mem<T>
export type ToMem<T> = T | Mem<T>

///////

export function toGet<T>(value: ToGet<T>): Get<T> {
  if (isGet(value) || isMem(value)) {
    return value
  } else {
    return () => value
  }
}

export function toMem<T>(value: ToMem<T>): Mem<T> {
  if (isMem(value)) {
    return value
  } else {
    return cell(value)
  }
}

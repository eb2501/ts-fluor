import { cell, isGet, isMem, once, type Get, type Mem } from "../core"

export type ToGet<T> = Get<T> | T

export function toGet<T>(arg: ToGet<T>): Get<T> {
  if (isGet(arg)) {
    return arg
  } else {
    return once(() => arg)
  }
}

///////

export type ToMem<T> = Mem<T> | T

export function toMem<T>(arg: ToMem<T>): Mem<T> {
  if (isMem(arg)) {
    return arg
  } else {
    return cell(arg)
  }
}

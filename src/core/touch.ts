import { isMem, type Get, type Mem } from "./basic"
import { cell } from "./cache"
import { view } from "./view"


export interface Touch {
  touch(): void
}

export function touch<T>(arg: Mem<T>): Mem<T> & Touch
export function touch<T>(arg: Get<T>): Get<T> & Touch
export function touch<T>(arg: Get<T> | Mem<T>): (Get<T> | Mem<T>) & Touch {
  const toggle = cell(false)
  const fnGet = () => {
    toggle()
    return arg()
  }
  let res: any
  if (isMem(arg)) {
    res = view(
      fnGet,
      (value) => {
        arg(value)
        toggle(false)
      }
    )
  } else {
    res = view(
      fnGet,
    )
  }
  Object.defineProperty(
    res,
    "touch",
    {
      value: () => { toggle(false) },
      writable: false,
      enumerable: true,
      configurable: false,
    }
  )
  return res
}


export interface Get<T> {
  (): T
  readonly type: "get" | "mem"
}

export interface Mem<T> {
  (value?: T): T
  readonly type: "mem"
}

///////

export function isGet<T, U>(arg: Get<T> | U): arg is Get<T> {
  return (typeof arg === "function")
      && ("type" in arg)
      && (arg.type === "get")
}

export function isMem<T, U>(arg: Mem<T> | U): arg is Mem<T> {
  return (typeof arg === "function")
      && ("type" in arg)
      && (arg.type === "mem")
}

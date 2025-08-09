
export interface Get<T> {
  (): T
}

export interface Set<T> {
  (value: T): T
}

export interface Mem<T> {
  (value?: T): T
}

///////

export function isGet<T>(value: T | Get<T>): value is Get<T> {
  return typeof value === "function"
}

export function isSet<T>(value: T | Set<T>): value is Set<T> {
  return typeof value === "function"
}

export function isMem<T>(value: T | Mem<T>): value is Mem<T> {
  return typeof value === "function"
}

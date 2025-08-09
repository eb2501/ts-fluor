import { NodeReactor } from "./reactor"
import { type Cache, type Listener } from "./cache"
import { type Get } from "./triad"

export type Node<T> = Get<T> & Cache

///////

interface Carrier<T> {
  readonly _payload: T
}

///////

const carrierIsCached = function (this: Carrier<Cache>): boolean {
  return this._payload.isCached
}

const carrierAddListener = function (this: Carrier<Cache>, listener: Listener): void {
  this._payload.addListener(listener)
}

const carrierRemoveListener = function (this: Carrier<Cache>, listener: Listener): void {
  this._payload.removeListener(listener)
}

///////

export function node<T>(arg: Get<T>): Node<T> {
  const target = new NodeReactor(arg)
  const node = function () {
    return target.get()
  } as any
  Object.defineProperty(
    node,
    "_payload",
    {
      value: target,
      enumerable: false,
    }
  )
  Object.defineProperty(
    node,
    "isCached",
    {
      get: carrierIsCached,
      enumerable: true,
    }
  )
  node.addListener = carrierAddListener
  node.removeListener = carrierRemoveListener
  return node
}

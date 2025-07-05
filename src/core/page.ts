import { CellReactor, NodeReactor } from "./reactor"
import { type Cache, type Listener } from "./cache"

export interface Node<T> {
  (): T
}

export interface Cell<T> {
  (value?: T): T
}

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

export class Page {
  protected cell<T>(value: T): Cell<T> {
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

  protected node<T>(getFn: () => T): Node<T> {
    const target = new NodeReactor(getFn)
    const node = function () {
      return target.get()
    } as any
    Object.defineProperty(node, "_payload", {
      value: target,
      enumerable: false,
    })
    Object.defineProperty(node, "isCached", {
      get: carrierIsCached,
      enumerable: true,
    })
    node.addListener = carrierAddListener
    node.removeListener = carrierRemoveListener
    return node
  }
}

import { CellReactor, NodeReactor } from "./reactor"
import { type Cache, type Listener } from "./cache"
import { isFunction } from "./utils"

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

function isNodeAndCache<T>(value: any): value is Node<T> & Cache {
  return typeof value === "function" && "_payload" in value
}

function isCell<T>(value: any): value is Cell<T> {
  return typeof value === "function"
}

///////

export type ToNode<T> = T | (() => T) | Node<T> | Cell<T>

export type ToCell<T> = T | Cell<T>

///////

export class Page {
  protected cell<T>(value: ToCell<T>): Cell<T> {
    if (isCell<T>(value)) {
      return value
    } else {
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
  }

  protected node<T>(value: ToNode<T>): Node<T> & Cache {
    if (isNodeAndCache<T>(value)) {
      return value
    } else {
      const target = new NodeReactor(
        isFunction(value) ? value : () => value
      )
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
}

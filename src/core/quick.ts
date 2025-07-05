import { type Read } from "./read"
import type { Write } from "./write"
import { type Cache, type Listener } from "./cache"

export interface QuickRead<T> {
    (): T
}

export interface QuickWrite<T> {
    (value?: T): T
}

///////

interface Carrier<T> {
    readonly _payload: T
}

///

const carrierGet = function <T>(this: Carrier<Read<T>>): T {
  return this._payload.get()
}

const carrierSet = function <T>(this: Carrier<Write<T>>, value: T): void {
  this._payload.set(value)
}

const carrierIsCached = function (this: Carrier<Cache>): boolean {
  return this._payload.isCached
}

const carrierAddListener = function (this: Carrier<Cache>, listener: Listener): void {
  this._payload.addListener(listener)
}

const carrierRemoveListener = function (this: Carrier<Cache>, listener: Listener): void {
  this._payload.removeListener(listener)
}

///

export function quickRead<T>(target: Read<T>): Read<T> & QuickRead<T> {
  const carrier = function () {
    return target.get()
  } as any

  Object.defineProperty(carrier, "_payload", {
    value: target,
    enumerable: false,
  })
    
  carrier.get = carrierGet
  return carrier
}

export function quickCache<T>(target: Read<T> & Cache): Read<T> & Cache & QuickRead<T> {
  const carrier = quickRead(target) as any

  Object.defineProperty(carrier, "isCached", {
    get: carrierIsCached,
    enumerable: true,
  })
  carrier.addListener = carrierAddListener
  carrier.removeListener = carrierRemoveListener
  return carrier
}

export function quickWrite<T>(target: Write<T>): Write<T> & QuickWrite<T> {
  const carrier = function (value?: T) {
    if (value !== undefined) {
      target.set(value)
      return value
    } else {
      return target.get()
    }
  } as any

  Object.defineProperty(carrier, "_payload", {
    value: target,
    enumerable: false,
  })
    
  carrier.get = carrierGet
  carrier.set = carrierSet
  return carrier
}

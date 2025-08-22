import type { Get, Mem } from "./basic"
import { view } from "./view"
import { CellReactor, NodeReactor, OnceReactor } from "./reactor"

export type Listener = (cached: boolean) => void

export interface Cache {
  readonly cached: boolean
  addListener(listener: Listener): void
  removeListener(listener: Listener): void
}

///////

interface Carrier<T> {
  readonly _payload: T
}

///////

const carrierCached = function (this: Carrier<Cache>): boolean {
  return this._payload.cached
}

const carrierAddListener = function (this: Carrier<Cache>, listener: Listener): void {
  this._payload.addListener(listener)
}

const carrierRemoveListener = function (this: Carrier<Cache>, listener: Listener): void {
  this._payload.removeListener(listener)
}

function addCache<T>(
  target: T,
  cache: Cache
) {
  const carrier = target as any
  Object.defineProperty(
    carrier,
    "_payload",
    {
      value: cache,
      writable: false,
      enumerable: false,
      configurable: false,
    }
  )
  Object.defineProperty(
    carrier,
    "cached",
    {
      get: carrierCached,
      enumerable: true,
      configurable: false,
    }
  )
  Object.defineProperty(
    carrier,
    "addListener",
    {
      value: carrierAddListener,
      writable: false,
      enumerable: true,
      configurable: false,
    }
  )
  Object.defineProperty(
    carrier,
    "removeListener",
    {
      value: carrierRemoveListener,
      writable: false,
      enumerable: true,
      configurable: false,
    }
  )
  return carrier
}

///////

export interface Node<T> extends Get<T>, Cache {
  readonly once: boolean
}

export function node<T>(arg: () => T): Node<T> {
  const reactor = new NodeReactor(arg)
  const res = addCache(
    view(() => reactor.getValue()),
    reactor
  )
  Object.defineProperty(
    res,
    "once",
    {
      value: false,
      writable: false,
      configurable: false,
      enumerable: false,
    }
  )
  return res
}

///////

export interface Once<T> extends Node<T> {
  readonly once: true
}

export function once<T>(arg: () => T): Once<T> {
  const reactor = new OnceReactor(arg)
  const res = addCache(
    view(() => reactor.getValue()),
    reactor
  )
  Object.defineProperty(
    res,
    "once",
    {
      value: true,
      writable: false,
      configurable: false,
      enumerable: false,
    }
  )
  return res
}

///////

export interface Cell<T> extends Mem<T>, Cache {
  readonly _once: false
}

export function cell<T>(value: T): Cell<T> {
  const reactor = new CellReactor(value)
  const res = addCache(
    view(
      () => reactor.getValue(),
      (value) => reactor.setValue(value)
    ),
    reactor
  )
  Object.defineProperty(
    res,
    "once",
    {
      value: false,
      writable: false,
      configurable: false,
      enumerable: false,
    }
  )
  return res
}

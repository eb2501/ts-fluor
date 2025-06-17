import { type Clear } from "./clear"
import { type Read } from "./read"
import { type Write } from "./write"
import { Reactor } from "./reactor"
import { Proxy } from "./proxy"
import { type Listener, type Cache } from "./cache"
import { type Quick } from "./quick"

export type ReadQ<T> = Read<T> & Quick<T>
export type WriteQ<T> = Write<T> & Quick<T>
export type NodeP<T> = ReadQ<T> & Clear
export type CellP<T> = WriteQ<T> & Clear
export type CellC<T> = CellP<T> & Cache
export type NodeC<T> = NodeP<T> & Cache

///

interface Carrier<T> extends Quick<T> {
    readonly _reactor: Reactor<T>
}

///

const carrierGet = function <T>(this: Carrier<T>): T {
    return this._reactor.get()
}

const carrierSet = function <T>(this: Carrier<T>, value: T): void {
    this._reactor.set(value)
}

const carrierClear = function <T>(this: Carrier<T>): void {
    this._reactor.clear()
}

const carrierIsCached = function <T>(this: Carrier<T>): boolean {
    return this._reactor.isCached
}

const carrierAddListener = function <T>(this: Carrier<T>, listener: Listener): void {
    this._reactor.addListener(listener)
}

const carrierRemoveListener = function <T>(this: Carrier<T>, listener: Listener): void {
    this._reactor.removeListener(listener)
}

///

function cell<T>(source: T | (() => T)): CellC<T> {
    const cache = new Reactor(source);

    const carrier = function () { return cache.get() } as any
    Object.defineProperty(carrier, "_reactor", {
        value: cache,
        enumerable: false,
    })
    carrier.get = carrierGet
    carrier.set = carrierSet
    carrier.clear = carrierClear
    Object.defineProperty(carrier, "isCached", {
        get: carrierIsCached,
        enumerable: true,
    })
    carrier.addListener = carrierAddListener
    carrier.removeListener = carrierRemoveListener

    return carrier
}

///


function node<T>(source: T | (() => T)): NodeC<T> {
    const cache = new Reactor(source);

    const carrier = function () { return cache.get() } as any
    Object.defineProperty(carrier, "_reactor", {
        value: cache,
        enumerable: false,
    })
    carrier.get = carrierGet
    carrier.clear = carrierClear
    Object.defineProperty(carrier, "isCached", {
        get: carrierIsCached,
        enumerable: true,
    })
    carrier.addListener = carrierAddListener
    carrier.removeListener = carrierRemoveListener

    return carrier
}

///

function proxy<T>(
    getFn: () => T,
    setFn?: (value: T) => void,
    clearFn?: () => void
): CellP<T> {
    const cache = new Proxy(getFn, setFn, clearFn);

    const carrier = function () { return cache.get() } as any;
    Object.defineProperty(carrier, "_reactor", {
        value: cache,
        enumerable: false,
    });
    carrier.get = carrierGet
    carrier.set = carrierSet
    carrier.clear = carrierClear

    return carrier
}

///

export class Page {
    protected cell<T>(source: T | (() => T)): CellC<T> {
        return cell(source);
    }

    protected node<T>(getFn: () => T): NodeC<T> {
        return node(getFn)
    }

    protected proxy<T>(getFn: () => T): ReadQ<T>
    protected proxy<T>(getFn: () => T, setFn: (value: T) => void): WriteQ<T>
    protected proxy<T>(getFn: () => T, clearFn: () => void): NodeP<T>
    protected proxy<T>(getFn: () => T, setFn: (value: T) => void, clearFn: () => void): CellP<T>

    protected proxy<T>(
        getFn: () => T,
        setFn?: (value: T) => void,
        clearFn?: () => void
    ): CellP<T> {
        return proxy(getFn, setFn, clearFn);
    }
}

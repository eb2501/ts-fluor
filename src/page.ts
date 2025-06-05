import { Clear } from "./clear"
import { Read } from "./read"
import { Write } from "./write"
import { Reactor } from "./reactor"
import { View } from "./view"
import { Listener, State } from "./state"
import { Quick } from "./quick"
import { Ticket } from "./ticket"

export type ReadView<T> = Quick<T> & Read<T>
export type WriteView<T> = Quick<T> & Write<T>
export type NodeView<T> = ReadView<T> & Clear
export type CellView<T> = WriteView<T> & Clear
export type Cell<T> = CellView<T> & State
export type Node<T> = NodeView<T> & State

///

interface Proxy<T> extends Quick<T>{
    readonly _cache: Reactor<T>
}

///

const proxyGet = function <T>(this: Proxy<T>): T {
    return this._cache.get()
}

const proxySet = function <T>(this: Proxy<T>, value: T): void {
    this._cache.set(value)
}

const proxyClear = function <T>(this: Proxy<T>): void {
    this._cache.clear()
}

const proxyIsLoaded = function <T>(this: Proxy<T>): boolean {
    return this._cache.isLoaded
}

const proxyAddListener = function <T>(this: Proxy<T>, listener: Listener): Ticket {
    return this._cache.addListener(listener)
}

///

function cell<T>(source: T | (() => T)): Cell<T> {
    const cache = new Reactor(source);

    const result = function () { return cache.get() } as any
    Object.defineProperty(result, "_cache", {
        value: cache,
        enumerable: false,
    })
    result.get = proxyGet
    result.set = proxySet
    result.clear = proxyClear
    Object.defineProperty(result, "isLoaded", {
        get: () => cache.isLoaded,
        enumerable: true,
    })
    result.addListener = proxyAddListener

    return result
}

///


function node<T>(source: T | (() => T)): Node<T> {
    const cache = new Reactor(source);

    const result = function () { return cache.get() } as any
    Object.defineProperty(result, "_cache", {
        value: cache,
        enumerable: false,
    })
    result.get = proxyGet
    result.clear = proxyClear
    Object.defineProperty(result, "isLoaded", {
        get: proxyIsLoaded,
        enumerable: true,
    })
    result.addListener = proxyAddListener

    return result
}

///

function view<T>(
    getFn: () => T,
    setFn?: (value: T) => void,
    clearFn?: () => void
): CellView<T> {
    const cache = new View(getFn, setFn, clearFn);

    const result = function () { return cache.get() } as any;
    Object.defineProperty(result, "_cache", {
        value: cache,
        enumerable: false,
    });
    result.get = proxyGet
    result.set = proxySet
    result.clear = proxyClear

    return result
}

///

export class Page {
    protected cell<T>(source: T | (() => T)): Cell<T> {
        return cell(source);
    }

    protected node<T>(getFn: () => T): Node<T> {
        return node(getFn)
    }

    protected view<T>(getFn: () => T): ReadView<T>
    protected view<T>(getFn: () => T, setFn: (value: T) => void): WriteView<T>
    protected view<T>(getFn: () => T, clearFn: () => void): NodeView<T>
    protected view<T>(getFn: () => T, setFn: (value: T) => void, clearFn: () => void): CellView<T>

    protected view<T>(
        getFn: () => T,
        setFn?: (value: T) => void,
        clearFn?: () => void
    ): CellView<T> {
        return view(getFn, setFn, clearFn);
    }
}

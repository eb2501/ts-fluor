import invariant from "tiny-invariant"
import { finalizer } from "./finalizer"
import { type Cache, type Listener } from "./cache"
import { type Ticket } from "./ticket"
import { type Write } from "./write"
import { getCurrentMode, withMode } from "./mode"
import type { Read } from "./read"


type Caller = WeakRef<NodeReactor<any>>

///

interface Callee {
    _addCaller(caller: Caller): void
    _removeCaller(caller: Caller): void
}

///

let currentContext: Set<Callee> | null = null

///

export class CellReactor<T> implements Write<T>, Callee {
    private callers = new Set<Caller>()
    private value: T

    constructor(value: T) {
        this.value = value
        this.callers = new Set()
    }

    //
    // Write<T>
    //

    get(): T {
        return withMode("read", () => {
            if (currentContext) {
                currentContext.add(this)
            }
            return this.value
        })
    }

    _invalidate(): void {
        const callers = this.callers
        this.callers = new Set()
        callers.forEach((ref) => {
            const caller = ref.deref()
            if (caller) {
                caller._invalidate()
            }
        })
    }

    set(value: T): void {
        withMode("free", () => {
            this._invalidate()
            this.value = value
        })
    }

    //
    // Callee
    //

    _addCaller(caller: Caller): void {
        invariant(!this.callers.has(caller))
        this.callers.add(caller)
    }

    _removeCaller(caller: Caller): void {
        this.callers.delete(caller)
    }
}

///////

class ReactorTicket implements Ticket {
    private readonly caller: Caller
    private readonly callees: Callee[]

    constructor(caller: Caller, callees: Callee[]) {
        this.caller = caller
        this.callees = callees
    }

    burn(): void {
        this.callees.forEach((callee) =>
            callee._removeCaller(this.caller)
        )
    }
}

///

export class NodeReactor<T> implements Read<T>, Cache, Callee {
    private readonly self: Caller = new WeakRef(this)
    private readonly callees: Callee[] = []
    private readonly getFn: () => T
    private callers: Set<Caller> | null
    private value: T | null
    private listeners: Set<Listener> | null = null

    constructor(getFn: () => T) {
        this.getFn = getFn
        this.value = null
        this.callers = null
        finalizer.register(
            this.self,
            new ReactorTicket(this.self, this.callees),
        )
    }

    private notify(): void {
        invariant(getCurrentMode() !== "locked")
        withMode("locked", () => {
            this.listeners?.forEach((listener) => {
                try {
                    listener(this.callers !== null)
                } catch (error) {
                    console.error("Error in listener:", error)
                }
            })
        })
    }

    //
    // Read<T>
    //

    get(): T {
        return withMode("read", () => {
            if (this.callers === null) {
                const previousContext = currentContext
                currentContext = new Set<Callee>()
                try {
                    this.value = this.getFn();
                    currentContext.forEach((callee) => {
                        callee._addCaller(this.self)
                        this.callees.push(callee)
                    });
                } finally {
                    currentContext = previousContext;
                }
                this.callers = new Set()
                this.notify()
            }
            if (currentContext) {
                currentContext.add(this)
            }
            return this.value as T
        })
    }

    _invalidate(): void {
        invariant(this.callers !== null)
        const callers = this.callers
        this.callers = null
        callers.forEach((ref) => {
            const caller = ref.deref()
            if (caller) {
                caller._invalidate()
            }
        })
        this.callees.forEach((callee) => callee._removeCaller(this.self))
        this.callees.length = 0
        this.value = null
        this.notify()
    }

    //
    // State
    //

    get isCached(): boolean {
        return this.callers !== null
    }

    addListener(listener: Listener): void {
        if (this.listeners === null) {
            this.listeners = new Set()
        }
        if (this.listeners.has(listener)) {
            throw new Error("Listener already added")
        }
        this.listeners.add(listener)
    }

    removeListener(listener: Listener): void {
        if ((this.listeners === null) || (!this.listeners.has(listener))) {
            throw new Error("Listener not found")
        }
        this.listeners.delete(listener)
        if (this.listeners.size === 0) {
            this.listeners = null
        }
    }

    //
    // Callee
    //

    _addCaller(caller: Caller): void {
        invariant((this.callers !== null) && (!this.callers.has(caller)))
        this.callers.add(caller)
    }

    _removeCaller(caller: Caller): void {
        if (this.callers !== null) {
            this.callers.delete(caller)
        }
    }
}

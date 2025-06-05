import invariant from "../node_modules/tiny-invariant/dist/tiny-invariant"
import { Clear } from "./clear"
import { finalizer } from "./finalizer"
import { State, Listener } from "./state"
import { Ticket } from "./ticket"
import { Write } from "./write"
import { isFunction } from "./utils"
import { getCurrentMode, withMode } from "./mode"


type Caller = WeakRef<Clear>

///

interface Callee {
    _addCaller(caller: Caller): void
    _removeCaller(caller: Caller): void
}

///

let currentContext: Set<Callee> | null = null

///

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

class ListenerTicket<T> implements Ticket {
    private readonly reactor: Reactor<T>
    private readonly listener: Listener

    constructor(reactor: Reactor<T>, listener: Listener) {
        this.reactor = reactor
        this.listener = listener
    }

    burn(): void {
        this.reactor._removeListener(this.listener)
    }
}

///

export class Reactor<T> implements Write<T>, Clear, State, Callee {
    private readonly self: Caller = new WeakRef(this)
    private readonly callees: Callee[] = []
    private readonly source: T | (() => T)
    private callers: Set<Caller> | null
    private value: T | null
    private listeners: Set<Listener> | null = null

    constructor(source: T | (() => T)) {
        this.source = source
        if (isFunction(source)) {
            this.value = null
            this.callers = null
        } else {
            this.value = source
            this.callers = new Set()
        }
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
    // Write<T>
    //

    get(): T {
        return withMode("read", () => {
            if (this.callers === null) {
                invariant(isFunction(this.source))
                const previousContext = currentContext
                currentContext = new Set<Callee>()
                try {
                    this.value = this.source();
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

    private invalidate(): void {
        invariant(this.callers !== null)
        const callers = this.callers
        this.callers = null
        callers.forEach((ref) => {
            const caller = ref.deref()
            if (caller) {
                caller.clear()
            }
        })
        this.callees.forEach((callee) => callee._removeCaller(this.self))
        this.callees.length = 0
        this.value = null
    }

    set(value: T): void {
        withMode("free", () => {
            if (this.callers === null) {
                this.value = value
                this.callers = new Set()
                this.notify()
            } else {
                this.invalidate()
                this.value = value
                this.callers = new Set()
            }
        })
    }

    clear(): void {
        withMode("free", () => {
            if (this.callers !== null) {
                this.invalidate()
                if (isFunction(this.source)) {
                    this.value = null
                    this.callers = null
                    this.notify()
                } else {
                    this.value = this.source
                    this.callers = new Set()
                }
            }
        })
    }

    //
    // State
    //

    get isLoaded(): boolean {
        return this.callers !== null
    }

    addListener(listener: Listener): Ticket {
        if (this.listeners === null) {
            this.listeners = new Set()
        }
        if (this.listeners.has(listener)) {
            throw new Error("Listener already added")
        }
        this.listeners.add(listener)
        return new ListenerTicket(this, listener)
    }

    _removeListener(listener: Listener): void {
        invariant((this.listeners !== null) && (this.listeners.has(listener)))
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
